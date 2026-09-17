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

log "npm ci + npm run build inside node:22-bookworm-slim (linux/amd64)"
docker run --rm --platform linux/amd64 \
  -v "$ROOT:/app" -w /app \
  -e CI=1 \
  node:22-bookworm-slim \
  bash -lc 'apt-get update -qq && apt-get install -y -qq python3 make g++ >/dev/null && npm ci && npm run build'

test -f "$ROOT/.next/standalone/server.js"
log "ok: .next/standalone/server.js"
