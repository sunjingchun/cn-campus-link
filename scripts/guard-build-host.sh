#!/usr/bin/env bash
# Refuse npm run build on reports-vps (1.6GB RAM). OOM has taken the host down before.
# Called from deploy.sh before build. Override only with explicit operator ack:
#   NIHAOCAMPUS_ALLOW_VPS_BUILD=1 npm run build
#
#   bash scripts/guard-build-host.sh

set -euo pipefail

if [[ "${NIHAOCAMPUS_ALLOW_VPS_BUILD:-}" == "1" ]]; then
  printf 'guard-build-host: NIHAOCAMPUS_ALLOW_VPS_BUILD=1, skipping checks\n' >&2
  exit 0
fi

if [[ -d /var/www/nihaocampus ]] || [[ -f /etc/nginx/sites-enabled/intro.10n1j.top ]]; then
  printf 'guard-build-host: refuse build on reports-vps production host\n' >&2
  printf 'guard-build-host: build on Mac Docker/WSL or another Linux builder, then rsync via deploy.sh\n' >&2
  exit 1
fi

if [[ -r /proc/meminfo ]]; then
  mem_kb="$(awk '/^MemTotal:/ {print $2}' /proc/meminfo)"
  if [[ "$mem_kb" -lt 2000000 ]]; then
    printf 'guard-build-host: refuse build: MemTotal %s KB < 2 GB\n' "$mem_kb" >&2
    printf 'guard-build-host: this machine is too small for next build (see README deploy section)\n' >&2
    exit 1
  fi
fi
