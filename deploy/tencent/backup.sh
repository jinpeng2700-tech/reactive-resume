#!/bin/sh
set -eu

umask 077
backup_dir=/var/backups/reactive-resume
stamp=$(date -u +%Y%m%dT%H%M%SZ)
tmp_sql="$backup_dir/.postgres-$stamp.sql"
tmp_gz="$backup_dir/.postgres-$stamp.sql.gz"
backup="$backup_dir/postgres-$stamp.sql.gz"

mkdir -p "$backup_dir"
trap 'rm -f "$tmp_sql" "$tmp_gz"' EXIT

cd /opt/reactive-resume
docker compose --env-file /etc/reactive-resume/secrets/reactive-resume.env -f compose.yml \
  exec -T postgres pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" > "$tmp_sql"
gzip -c "$tmp_sql" > "$tmp_gz"
mv "$tmp_gz" "$backup"
find "$backup_dir" -type f -name 'postgres-*.sql.gz' -mtime +6 -delete
