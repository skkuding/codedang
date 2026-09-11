#!/usr/bin/env bash
# Runs the Iris Polygon E2E suite with reproducible, host-visible logs.
#
# Usage:
#   scripts/e2e-polygon.sh G1 G2 V1 V2
#   scripts/e2e-polygon.sh --all
#   scripts/e2e-polygon.sh --keep-iris G1
#
# Logs are written to logs/e2e/polygon/<timestamp>/ and are ignored by Git.

set -Eeuo pipefail

ROOT_DIR=$(git rev-parse --show-toplevel)
RUN_ID=$(date +%Y%m%d-%H%M%S)
LOG_DIR=${E2E_LOG_DIR:-"$ROOT_DIR/logs/e2e/polygon/$RUN_ID"}
if [[ $LOG_DIR != "$ROOT_DIR/"* ]]; then
  echo "E2E_LOG_DIR must be inside $ROOT_DIR so the dev container can write to it." >&2
  exit 1
fi
CONTAINER_LOG_DIR="/workspace/${LOG_DIR#"$ROOT_DIR/"}"
IRIS_LOG="$LOG_DIR/iris.log"
E2E_LOG="$LOG_DIR/e2e.log"
EVENT_LOG="$LOG_DIR/events.ndjson"
PID_FILE="$CONTAINER_LOG_DIR/iris.pid"
BIN_PATH="/tmp/codedang-e2e-iris-$RUN_ID"
KEEP_IRIS=false
STARTED_IRIS=false

if [[ ${1:-} == '--keep-iris' ]]; then
  KEEP_IRIS=true
  shift
fi

mkdir -p "$LOG_DIR"

print_logs() {
  printf '\nLogs saved to:\n'
  printf '  Iris:   %s\n' "$IRIS_LOG"
  printf '  E2E:    %s\n' "$E2E_LOG"
  printf '  Events: %s\n' "$EVENT_LOG"
  if [[ -f $IRIS_LOG ]]; then
    printf '\n--- Iris log (last 80 lines) ---\n'
    tail -n 80 "$IRIS_LOG" || true
  fi
}

stop_iris() {
  if [[ $STARTED_IRIS != true || $KEEP_IRIS == true ]]; then
    return
  fi
  docker exec codedang-dev sh -lc "
    if [ -f '$PID_FILE' ]; then
      kill \"\$(cat '$PID_FILE')\" 2>/dev/null || true
      rm -f '$PID_FILE'
    fi
    rm -f '$BIN_PATH'
  " || true
}

trap 'status=$?; stop_iris; print_logs; exit $status' EXIT

cd "$ROOT_DIR"

if ! docker inspect --format '{{.State.Running}}' codedang-dev 2>/dev/null | grep -qx true; then
  echo 'codedang-dev is not running. Reopen the dev container before running this E2E suite.' >&2
  exit 1
fi

if docker exec codedang-dev sh -lc 'pgrep -f "[c]odedang-e2e-iris|/tmp/[c]odedang-e2e-iris" >/dev/null'; then
  echo 'An Iris E2E process is already running; stop it before starting another suite.' >&2
  exit 1
fi

echo 'Starting E2E dependencies (RabbitMQ, PostgreSQL, MinIO)...'
docker compose up -d rabbitmq database storage

echo 'Waiting for MinIO to become ready...'
for _ in $(seq 1 30); do
  if docker exec --user node codedang-dev sh -lc 'curl -fs http://127.0.0.1:9000/minio/health/ready >/dev/null 2>&1'; then
    break
  fi
  sleep 1
done
if ! docker exec --user node codedang-dev sh -lc 'curl -fs http://127.0.0.1:9000/minio/health/ready >/dev/null 2>&1'; then
  echo 'MinIO did not become ready within 30 seconds.' >&2
  exit 1
fi

echo 'Initializing RabbitMQ and MinIO topology...'
docker exec --user node codedang-dev sh -lc '
  cd /workspace
  . ./.envrc
  pnpm init:rabbitmq
  pnpm init:storage
'

echo 'Ensuring the devcontainer user can execute libjudger.so...'
docker exec codedang-dev sh -lc 'chmod 755 /app/sandbox/libjudger.so'

echo "Building and starting Iris; writing logs to $IRIS_LOG"
# libjudger creates cgroup subdirectories; it requires the privileged container's
# root user. The test client itself still runs as the non-root devcontainer user.
docker exec \
  -e E2E_IRIS_LOG="$CONTAINER_LOG_DIR/iris.log" \
  -e E2E_IRIS_PID_FILE="$PID_FILE" \
  -e E2E_IRIS_BIN="$BIN_PATH" \
  codedang-dev sh -lc '
    set -eu
    cd /workspace
    . ./.envrc
    set -a
    . apps/iris/.env
    set +a
    cd apps/iris
    go build -o "$E2E_IRIS_BIN" . >>"$E2E_IRIS_LOG" 2>&1
    nohup "$E2E_IRIS_BIN" >>"$E2E_IRIS_LOG" 2>&1 &
    echo $! >"$E2E_IRIS_PID_FILE"
  '
STARTED_IRIS=true

for _ in $(seq 1 60); do
  if grep -q 'Server Started' "$IRIS_LOG"; then
    break
  fi
  if ! docker exec codedang-dev sh -lc "kill -0 \"\$(cat '$PID_FILE')\" 2>/dev/null"; then
    echo 'Iris exited before becoming ready.' >&2
    exit 1
  fi
  sleep 1
done

if ! grep -q 'Server Started' "$IRIS_LOG"; then
  echo 'Timed out waiting for Iris to become ready.' >&2
  exit 1
fi

echo "Running Polygon E2E scenarios: ${*:-all}"
set +e
docker exec --user node \
  -e E2E_EVENT_LOG="$CONTAINER_LOG_DIR/events.ndjson" \
  codedang-dev sh -lc 'cd /workspace && . ./.envrc && pnpm e2e:polygon "$@"' e2e-polygon "$@" \
  2>&1 | tee "$E2E_LOG"
E2E_STATUS=${PIPESTATUS[0]}
set -e

exit "$E2E_STATUS"
