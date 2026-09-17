#!/usr/bin/env bash
# Five-step release. Build on the operator machine, rsync a timestamped
# standalone tree, flip a symlink, reload, then smoke. On smoke failure
# the symlink goes back to the previous release.
#
#   bash scripts/deploy.sh
#
# Local staging (Mac):
#   NIHAOCAMPUS_ALLOW_NONLINUX_BUILD=1 \
#   NIHAOCAMPUS_PROCESS=pidfile \
#   NIHAOCAMPUS_DEPLOY_ROOT=/tmp/nihaocampus-staging \
#   NIHAOCAMPUS_DB=/tmp/nihaocampus-staging/lib/nihaocampus.db \
#   NIHAOCAMPUS_PORT=41782 \
#   NIHAOCAMPUS_SMOKE_URL=http://127.0.0.1:41782 \
#   bash scripts/deploy.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

DEPLOY_ROOT="${NIHAOCAMPUS_DEPLOY_ROOT:-/var/www/nihaocampus}"
DB_PATH="${NIHAOCAMPUS_DB:-/var/lib/nihaocampus/nihaocampus.db}"
SMOKE_URL="${NIHAOCAMPUS_SMOKE_URL:-http://127.0.0.1:41729}"
PORT="${NIHAOCAMPUS_PORT:-41729}"
PROCESS="${NIHAOCAMPUS_PROCESS:-pm2}"
SKIP_BUILD="${NIHAOCAMPUS_SKIP_BUILD:-}"
ALLOW_NONLINUX="${NIHAOCAMPUS_ALLOW_NONLINUX_BUILD:-}"
HOSTNAME_BIND="${NIHAOCAMPUS_HOSTNAME:-127.0.0.1}"

log() { printf 'deploy: %s\n' "$*"; }

if [[ "$(uname -s)" != "Linux" && -z "$ALLOW_NONLINUX" ]]; then
  printf 'deploy: refuse to build on %s. better-sqlite3 native bindings must match the VPS.\n' "$(uname -s)" >&2
  printf 'deploy: build on Linux, or set NIHAOCAMPUS_ALLOW_NONLINUX_BUILD=1 for local staging.\n' >&2
  exit 1
fi

wait_http() {
  local url="$1"
  local i
  for i in $(seq 1 60); do
    if curl -sf -o /dev/null "$url"; then
      return 0
    fi
    sleep 0.5
  done
  return 1
}

reload_app() {
  mkdir -p "$DEPLOY_ROOT" "$(dirname "$DB_PATH")"
  export NODE_ENV=production
  export PORT
  export HOSTNAME="$HOSTNAME_BIND"
  export NIHAOCAMPUS_DB="$DB_PATH"
  unset NIHAOCAMPUS_SEED_DEMO || true

  if [[ "$PROCESS" == "pidfile" ]]; then
    local pidfile="$DEPLOY_ROOT/nihaocampus.pid"
    if [[ -f "$pidfile" ]]; then
      local old
      old="$(cat "$pidfile")"
      if [[ -n "$old" ]] && kill -0 "$old" 2>/dev/null; then
        kill "$old" || true
        local i
        for i in $(seq 1 40); do
          if kill -0 "$old" 2>/dev/null; then
            sleep 0.25
          else
            break
          fi
        done
        if kill -0 "$old" 2>/dev/null; then
          kill -9 "$old" || true
        fi
      fi
    fi
    local oldpwd="$PWD"
    cd "$DEPLOY_ROOT/current"
    if [[ -n "${NIHAOCAMPUS_ADMIN_TOKEN:-}" ]]; then
      nohup env NODE_ENV=production PORT="$PORT" HOSTNAME="$HOSTNAME_BIND" NIHAOCAMPUS_DB="$DB_PATH" \
        NIHAOCAMPUS_ADMIN_TOKEN="$NIHAOCAMPUS_ADMIN_TOKEN" \
        node server.js >>"$DEPLOY_ROOT/nihaocampus.log" 2>&1 &
    else
      nohup env NODE_ENV=production PORT="$PORT" HOSTNAME="$HOSTNAME_BIND" NIHAOCAMPUS_DB="$DB_PATH" \
        node server.js >>"$DEPLOY_ROOT/nihaocampus.log" 2>&1 &
    fi
    echo $! >"$pidfile"
    disown || true
    cd "$oldpwd"
    return 0
  fi

  if ! command -v pm2 >/dev/null 2>&1; then
    printf 'deploy: pm2 not found. Install it, or set NIHAOCAMPUS_PROCESS=pidfile.\n' >&2
    exit 1
  fi
  cp "$ROOT/ecosystem.config.cjs" "$DEPLOY_ROOT/ecosystem.config.cjs"
  if pm2 describe nihaocampus >/dev/null 2>&1; then
    pm2 reload nihaocampus --update-env
  else
    pm2 start "$DEPLOY_ROOT/ecosystem.config.cjs"
  fi
}

log "gate audit-launch"
NIHAOCAMPUS_DB="$DB_PATH" node "$ROOT/scripts/audit-launch.mjs"

if [[ -z "$SKIP_BUILD" ]]; then
  log "step 1/5 build"
  bash "$ROOT/scripts/guard-build-host.sh"
  npm run build
else
  log "step 1/5 build skipped"
fi
test -f "$ROOT/.next/standalone/server.js"

RELEASE_ID="$(date -u +%Y%m%dT%H%M%SZ)"
RELEASE_DIR="$DEPLOY_ROOT/releases/$RELEASE_ID"
CURRENT="$DEPLOY_ROOT/current"
mkdir -p "$DEPLOY_ROOT/releases" "$(dirname "$DB_PATH")"

log "step 2/5 rsync $RELEASE_ID"
mkdir -p "$RELEASE_DIR/.next"
rsync -a "$ROOT/.next/standalone/" "$RELEASE_DIR/"
rsync -a "$ROOT/.next/static/" "$RELEASE_DIR/.next/static/"
if [[ -d "$ROOT/public" ]]; then
  mkdir -p "$RELEASE_DIR/public"
  rsync -a "$ROOT/public/" "$RELEASE_DIR/public/"
fi
cp "$ROOT/ecosystem.config.cjs" "$DEPLOY_ROOT/ecosystem.config.cjs"
test -f "$RELEASE_DIR/server.js"

PREV=""
if [[ -L "$CURRENT" ]]; then
  PREV="$(readlink "$CURRENT" || true)"
fi

log "step 3/5 symlink"
ln -sfn "$RELEASE_DIR" "$CURRENT"

log "step 4/5 reload"
reload_app
if ! wait_http "$SMOKE_URL/"; then
  log "reload did not become ready at $SMOKE_URL"
fi

log "step 5/5 smoke"
set +e
NIHAOCAMPUS_DB="$DB_PATH" NIHAOCAMPUS_SMOKE_URL="$SMOKE_URL" node "$ROOT/scripts/smoke.mjs" "$SMOKE_URL"
SMOKE_STATUS=$?
set -e

if [[ "$SMOKE_STATUS" -ne 0 ]]; then
  log "smoke failed, rollback"
  if [[ -n "$PREV" && -e "$PREV" ]]; then
    ln -sfn "$PREV" "$CURRENT"
    reload_app
    wait_http "$SMOKE_URL/" || true
    log "symlink restored to $PREV"
  else
    log "no previous release to restore"
  fi
  exit 1
fi

log "smoke six checks passed"
log "current -> $RELEASE_DIR"
