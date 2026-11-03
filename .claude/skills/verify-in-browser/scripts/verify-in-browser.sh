#!/usr/bin/env bash
# verify-in-browser.sh — serves a production build on port 3100, on the local e2e database and API fixtures.
# Usage: verify-in-browser.sh [--skip-build]   reseeds the database, builds and starts the server
#        verify-in-browser.sh --stop           stops the server this script started
set -euo pipefail

cd "$(dirname "$0")/../../../.."

PORT=3100
CONTAINER=trip-ai-e2e-pg
URL="http://localhost:$PORT"
PID_FILE=.playwright-mcp/verify-server.pid
LOG_FILE=.playwright-mcp/verify-server.log

listener() { lsof -nP -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null | head -n 1 || true; }

stop_server() {
  if [ ! -f "$PID_FILE" ]; then
    echo "No server recorded in $PID_FILE; nothing to stop."
    return 0
  fi
  local pid
  pid=$(cat "$PID_FILE")
  rm -f "$PID_FILE"
  # A recorded pid can be stale, and something else may hold the port by now.
  if [ "$(listener)" != "$pid" ]; then
    echo "Process $pid no longer holds port $PORT; nothing stopped."
    return 0
  fi
  kill "$pid"
  echo "Stopped the server on port $PORT (process $pid)."
}

SKIP_BUILD=0
case "${1:-}" in
  "") ;;
  --skip-build) SKIP_BUILD=1 ;;
  --stop) stop_server; exit 0 ;;
  -h|--help) sed -n '2,4p' "$0"; exit 0 ;;
  *) echo "usage: $0 [--skip-build | --stop]" >&2; exit 2 ;;
esac

echo "+ checking the $CONTAINER container"
if [ "$(docker inspect -f '{{.State.Running}}' "$CONTAINER" 2>/dev/null || true)" != "true" ]; then
  cat >&2 <<EOF
$CONTAINER isn't running. Start it with:
  docker start $CONTAINER
or, if it doesn't exist yet:
  docker run -d --name $CONTAINER -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=trip_ai_e2e postgres:16
EOF
  exit 1
fi

echo "+ checking the database is local"
# isLocalDatabase, not mayWriteToDatabase: ALLOW_REMOTE_E2E_SEED must not let this script through.
DB_URL=$(npx tsx -e 'import("./scripts/localDatabase.ts").then(({ E2E_DATABASE_URL: url, isLocalDatabase }) => {
  if (!isLocalDatabase(url)) process.exit(3);
  console.log(url);
})' | tail -n 1) || {
  echo "E2E_DATABASE_URL isn't local. Point it at a local database; this script won't use a remote one." >&2
  exit 1
}

echo "+ checking port $PORT is free"
if [ -n "$(listener)" ]; then
  echo "Port $PORT is held by process $(listener). Stop it first, or run --stop if this script started it." >&2
  exit 1
fi

if [ "$SKIP_BUILD" -eq 1 ] && [ ! -f .next/BUILD_ID ]; then
  echo "--skip-build needs an existing build, and .next/BUILD_ID is missing." >&2
  exit 1
fi

echo "+ npm run db:push:e2e"
npm run --silent db:push:e2e
echo "+ npm run seed:e2e"
npm run --silent seed:e2e

if [ "$SKIP_BUILD" -eq 0 ]; then
  echo "+ npm run build"
  DATABASE_URL="$DB_URL" npm run --silent build
fi

echo "+ npm run start on port $PORT, with E2E_FIXTURES=1"
mkdir -p .playwright-mcp
E2E_FIXTURES=1 PORT="$PORT" DATABASE_URL="$DB_URL" nohup npm run --silent start >"$LOG_FILE" 2>&1 &
STARTED=$!

for _ in $(seq 1 60); do
  if curl -fsS -o /dev/null "$URL/" 2>/dev/null; then
    listener >"$PID_FILE"
    echo "Ready: $URL (process $(cat "$PID_FILE"), log in $LOG_FILE)"
    exit 0
  fi
  if ! kill -0 "$STARTED" 2>/dev/null; then
    echo "The server exited while starting. Last lines of $LOG_FILE:" >&2
    tail -n 20 "$LOG_FILE" >&2
    exit 1
  fi
  sleep 1
done

kill "$STARTED" 2>/dev/null || true
echo "The server didn't answer on $URL within 60 seconds. See $LOG_FILE." >&2
exit 1
