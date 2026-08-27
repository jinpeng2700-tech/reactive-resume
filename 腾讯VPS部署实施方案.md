# Reactive Resume 腾讯 VPS 部署实施方案

## 1. 目标与边界

目标：在腾讯 VPS 部署 `resume.ai2c.cloud`，持续跟进 Reactive Resume 官方版本，同时保留私人改动。

约束：

- 腾讯 VPS：`124.222.47.54`，无法直接访问 GitHub。
- 阿里 VPS：`47.85.54.116`；在本项目中仅作为 GOST TLS 出口中继。
- 阿里 VPS 上既有服务不属于本项目范围，不修改、不迁移，也不复用为本项目的应用、仓库、镜像仓库或备份。
- GitHub 私有仓库保存私人源码与部署相关文件。
- 腾讯 VPS 不克隆源码、不编译；仅拉取已验证镜像。
- 官方更新允许自动发现；合并、含破坏性迁移的发布必须人工批准。

官方 Docker 栈包含 PostgreSQL、Redis、SeaweedFS 和应用。v5.1 起不再需要 Browserless 或 Chromium；应用启动时会执行数据库迁移。

参考：

- [Reactive Resume Docker 自托管文档](https://github.com/amruthpillai/reactive-resume/blob/main/docs/getting-started/quickstart.mdx)
- [官方 compose.yml](https://github.com/amruthpillai/reactive-resume/blob/main/compose.yml)
- [GOST Proxy and Tunnel 文档](https://v3.gost.run/en/concepts/proxy/)
- [GOST Relay 文档](https://gost.run/en/tutorials/protocols/relay/)

## 2. 总体架构

```text
本地开发机
  ├─ origin   私有 GitHub 仓库
  └─ upstream 官方 Reactive Resume
                 │
          GitHub Actions
      测试、构建、推送私有 GHCR 镜像
                 │
腾讯 VPS ── GOST 加密隧道 ── 阿里 VPS（仅网络中继）── GitHub / GHCR
  │
Caddy: https://resume.ai2c.cloud
  │
Reactive Resume + PostgreSQL + Redis + SeaweedFS
```

推荐 GitHub Actions 构建、腾讯 VPS 拉取私有镜像。腾讯 VPS 本地构建会依赖 GitHub 连通性并增加资源消耗；完全自动合并官方更新会在源码冲突和数据库迁移时引入不可控风险。

## 3. 源码与更新模型

Git 的 `upstream` 是本地开发机与 CI 工作副本中的远程地址，不是 GitHub 私有仓库自身的内建能力。

```text
origin   = git@github.com:<账号>/reactive-resume.git
upstream = https://github.com/amruthpillai/reactive-resume.git
```

### 分支与标签

- `main`：可发布代码；官方代码加私人改动。
- `vendor/vX.Y.Z`：官方发布标签的原样镜像；仅同步工作流更新。
- `sync/upstream-vX.Y.Z`：将指定官方版本合入 `main` 的待审核分支。
- `vX.Y.Z-custom.N`：生产发布标签，例如 `v5.2.8-custom.1`。
- `CUSTOMIZATIONS.md`：私人改动、涉及文件、升级冲突处理说明。

### 官方更新流程

1. 定时 GitHub Action 检查官方最新稳定标签。
2. 发现新版本后创建或更新 `vendor/vX.Y.Z`。
3. 创建 `sync/upstream-vX.Y.Z` 合并请求。
4. 无冲突时运行测试；有冲突时在本地解决后提交。
5. 审核合并 `main`，打 `vX.Y.Z-custom.N` 标签。
6. CI 构建不可变镜像标签；人工生产发布步骤再更新 `production` 标签。
7. 腾讯 VPS 检测到 `production` 摘要变化后更新应用。

私人改动直接提交至 `main` 并推送 `origin`。官方代码永远通过同步分支合入，不能覆盖私人提交。

## 4. GOST 与网络

### 隧道职责

- `resume.ai2c.cloud`：A 记录指向腾讯 VPS `124.222.47.54`。
- 阿里 VPS 已有 GOST `relay+tls` 服务：`gost.service` 已启用，GOST 为 `v3.2.6`，监听 `*:8443`。
- 阿里 GOST 配置为 `/etc/gost/config.yaml`，服务以低权限 `gost:gost` 运行，并启用了 systemd 加固选项。
- 阿里 TLS 服务证书为 `/etc/gost/server.crt`，CA 证书为 `/etc/gost/ca.crt`；使用现有私有 CA，不使用公网 ACME 证书。
- 阿里 `80/443` 当前由 Nginx 占用，Caddy 未运行；均与本项目无关。Reactive Resume 不使用、也不修改阿里的 `80/443`。
- 腾讯 VPS：运行独立的 `gost-tencent.service`，仅监听 `127.0.0.1:18080`，链路目标为 `47.85.54.116:8443`。
- 腾讯客户端固定信任从阿里复制的 `ca.crt`，启用 `secure: true`，并将 TLS `serverName` 固定为 `47.85.54.116`。
- 在阿里现有多凭据配置中新增 Reactive Resume 专用凭据；不得复用京东 OpenViking 凭据，不得将凭据写入 Git 或本方案。
- Docker daemon：设置 `HTTP_PROXY` 与 `HTTPS_PROXY` 为 `http://127.0.0.1:18080`，以便拉取 GHCR 和其他容器镜像。
- 腾讯 GOST 客户端不开放公网端口。
- 阿里主机防火墙当前为 `INPUT ACCEPT`，访问控制完全依赖云安全组。GOST 日志已出现公网探测来源，因此部署前必须在阿里云安全组将 TCP `8443` 收紧为仅 `117.72.113.233/32`（既有京东服务）和 `124.222.47.54/32`（腾讯 Reactive Resume）；禁止 `0.0.0.0/0`。
- 阿里 GOST 配置变更需要重启 `gost.service`，会短暂影响京东 OpenViking 的镜像拉取；必须在维护窗口进行并验证京东客户端恢复。

首次部署时，从本地电脑校验 GOST 官方发布校验和后通过 SSH 上传 GOST 二进制到腾讯 VPS；同时安全复制阿里 `ca.crt`。腾讯 VPS 不能依赖直接下载 GitHub Release。

## 5. 腾讯 VPS 运行栈

目录：

```text
/opt/reactive-resume/                 Compose、Caddy、更新脚本
/etc/reactive-resume/secrets/         .env、GHCR 凭据、GOST 凭据
/var/backups/reactive-resume/         本地备份
```

权限：

```text
/etc/reactive-resume/secrets  0700 root:root
其中全部文件                0600 root:root
```

服务：

- 宿主机 Caddy：签发和续期 `resume.ai2c.cloud` 的 TLS 证书，反向代理到 `127.0.0.1:3000`。
- Docker Compose：Reactive Resume、PostgreSQL、Redis、SeaweedFS。
- 只有 Caddy 对公网开放 `80/443`。
- PostgreSQL、Redis、SeaweedFS 不映射公网端口。
- GOST、Caddy、Docker 更新器均由 systemd 管理。

应用环境变量至少包含：

```dotenv
APP_URL=https://resume.ai2c.cloud
DATABASE_URL=postgresql://...
AUTH_SECRET=<随机高熵密钥>
ENCRYPTION_SECRET=<随机高熵密钥>
S3_ACCESS_KEY_ID=<对象存储账号>
S3_SECRET_ACCESS_KEY=<对象存储密钥>
S3_ENDPOINT=http://seaweedfs:8333
S3_BUCKET=reactive-resume
S3_FORCE_PATH_STYLE=true
REDIS_URL=redis://redis:6379
```

CI 先检测腾讯 VPS 的 CPU 架构。默认构建 `linux/amd64`；若 VPS 为 ARM，则改为 `linux/arm64`。

## 6. 镜像构建、发布与更新

### GitHub Actions

- 触发：`main` 推送、`v*-custom.*` 标签、手动运行。
- 流程：测试、构建应用镜像、推送至私有 GHCR。
- 标签：Git SHA 不可变标签、发布标签和受控的 `production` 标签。
- 镜像写入 Git 提交 SHA、版本号和构建时间 OCI 标签。
- `production` 标签只能在迁移审查和测试通过后由人工发布步骤更新。

### 腾讯自动更新器

`reactive-resume-update.timer` 每 10 分钟执行：

1. 经本地 GOST 检查私有 GHCR 的 `production` 镜像摘要。
2. 摘要未变则退出。
3. 先运行 PostgreSQL `pg_dump`。
4. 拉取新镜像，仅重建应用容器。
5. 验证容器健康接口 `/api/health` 和公网 HTTPS。
6. 成功后记录当前镜像摘要。
7. 失败后将应用容器回退到上次成功镜像摘要，并保留日志。

限制：

- 包含 `DROP`、`TRUNCATE`、列类型变更或不兼容约束变更的迁移不自动发布。
- 回退镜像不等于回退数据库；数据库永不自动恢复。

## 7. 备份与恢复

- 每日运行 PostgreSQL `pg_dump`，腾讯本地保留 7 天。
- 异地备份必须写入阿里 VPS 以外的独立加密存储；目标未指定前，不启用异地同步。
- 恢复仅人工执行；自动脚本不得恢复数据库。
- 每次生产发布前强制创建一个额外备份点。

## 8. 实施顺序

1. 创建私有 GitHub 仓库，配置 `origin`/`upstream`、分支保护和同步工作流。
2. 配置 GHCR 构建与受控生产发布工作流。
3. 配置 `resume.ai2c.cloud` DNS。
4. 阿里 VPS 新增专用 GOST 凭据，将云安全组 `8443` 收紧为京东与腾讯两个固定源 IP；维护窗口重启并验证既有京东客户端。
5. 腾讯 VPS 执行 SSH 加固，安装 Docker、Caddy 和 GOST 客户端；复制阿里 CA 证书。
6. 设置 Docker daemon 经 GOST 出网，验证 GitHub API 与 GHCR 镜像拉取。
7. 配置 Compose、密钥、应用首个私有镜像、HTTPS 与备份。
8. 启用更新定时器，执行一次受控升级和回滚演练。

## 9. 实施前核对项

- 腾讯与阿里 VPS 的 Linux 发行版、版本和 CPU 架构。
- 阿里 VPS 的 Nginx 和所有既有业务均为本项目外部依赖；不得修改其配置、端口或进程。
- 阿里云安全组当前 `8443` 规则是否存在 `0.0.0.0/0`；必须以控制台实际规则为准，收紧后保留京东与腾讯两个固定源 IP。
- 腾讯客户端使用阿里 `/etc/gost/ca.crt`，不使用已过时的 `/etc/gost/ali-server.crt` 路径。
- DNS 托管方和 `resume.ai2c.cloud` 记录权限。
- 异地加密备份的独立目标；不得选择阿里 VPS。
- 私有 GitHub 仓库归属、GHCR 包权限和腾讯侧只读拉取凭据。
- 腾讯 VPS 的内存、磁盘空间与备份容量。
