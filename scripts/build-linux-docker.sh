#!/usr/bin/env bash
# Build a Linux standalone tree on macOS via Docker (reports-vps cannot npm run build).
# Produces .next/standalone with linux better-sqlite3 bindings.
#
#   bash scripts/build-linux-docker.sh
#
# Requires Docker. Output is written into the repo working tree (.next/).

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v docker >/dev/null 2>&1; then
  printf 'build-linux-docker: docker not found\n' >&2
  exit 1
fi

log() { printf 'build-linux-docker: %s\n' "$*"; }

# Full bookworm image already has python3/make/g++; slim + apt under qemu on Mac ARM is very slow.
log "npm ci + npm run build inside node:22-bookworm (linux/amd64)"
docker run --rm --platform linux/amd64 \
  -v "$ROOT:/app" -w /app \
  -e CI=1 \
  node:22-bookworm \
  bash -lc 'npm ci && npm run build'

test -f "$ROOT/.next/standalone/server.js"

# Next file tracing may keep the host prebuild; VPS needs linux-x64.
STANDALONE_PREBUILDS="$ROOT/.next/standalone/node_modules/better-sqlite3/prebuilds"
LINUX_PREBUILD="$ROOT/node_modules/better-sqlite3/prebuilds/linux-x64.node"
mkdir -p "$STANDALONE_PREBUILDS"
cp "$LINUX_PREBUILD" "$STANDALONE_PREBUILDS/"
find "$STANDALONE_PREBUILDS" -name 'darwin-*.node' -delete

log "ok: .next/standalone/server.js (linux-x64 better-sqlite3)"
