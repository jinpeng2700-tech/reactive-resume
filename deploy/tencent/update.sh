#!/bin/sh
set -eu

umask 077
root=/opt/reactive-resume
env_file=/etc/reactive-resume/secrets/reactive-resume.env
state_dir=/var/lib/reactive-resume
image_repository=ghcr.io/jinpeng2700-tech/reactive-resume-tencent
production_image="$image_repository:production"

set_image() {
  image=$1
  tmp="$env_file.tmp"
  grep -q '^IMAGE=' "$env_file"
  sed "s|^IMAGE=.*$|IMAGE=$image|" "$env_file" > "$tmp"
  mv "$tmp" "$env_file"
}

healthy() {
  attempts=0
  while [ "$attempts" -lt 18 ]; do
    if curl -fsS --max-time 5 http://127.0.0.1:3000/api/health >/dev/null &&
      curl -fsS --max-time 10 "$APP_URL/api/health" >/dev/null; then
      return 0
    fi
    attempts=$((attempts + 1))
    sleep 5
  done
  return 1
}

mkdir -p "$state_dir"
cd "$root"

docker pull "$production_image" >/dev/null
production_digest=$(docker image inspect --format '{{index .RepoDigests 0}}' "$production_image")
case "$production_digest" in
  "$image_repository"@sha256:*) ;;
  *) echo "Unable to resolve production image digest" >&2; exit 1 ;;
esac

current_file="$state_dir/current-image"
last_good_file="$state_dir/last-good-image"
running_id=$(docker inspect --format '{{.Image}}' "$(docker compose --env-file "$env_file" -f compose.yml ps -q app)")
production_id=$(docker image inspect --format '{{.Id}}' "$production_image")

if [ ! -f "$current_file" ] && [ "$running_id" = "$production_id" ]; then
  printf '%s\n' "$production_digest" > "$current_file"
  printf '%s\n' "$production_digest" > "$last_good_file"
  exit 0
fi

current_image=$(cat "$current_file" 2>/dev/null || true)
if [ "$current_image" = "$production_digest" ]; then
  exit 0
fi

old_image=$(grep '^IMAGE=' "$env_file" | cut -d= -f2-)
"$root/backup.sh"
set_image "$production_digest"

if docker compose --env-file "$env_file" -f compose.yml up -d --no-deps --force-recreate app >/dev/null && healthy; then
  printf '%s\n' "$production_digest" > "$current_file"
  printf '%s\n' "$production_digest" > "$last_good_file"
  exit 0
fi

set_image "$old_image"
docker compose --env-file "$env_file" -f compose.yml up -d --no-deps --force-recreate app >/dev/null
healthy
exit 1
