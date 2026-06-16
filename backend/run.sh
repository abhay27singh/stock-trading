#!/bin/bash
# Reliable backend startup. Usage: ./run.sh
# Kills any existing backend, then starts via Maven (correct classpath).

set -e
cd "$(dirname "$0")"

echo ">> Killing any existing backend on port 9090..."
lsof -ti :9090 | xargs kill -9 2>/dev/null || true
sleep 1

# Load .env from project root if present (DB_URL, DB_USERNAME, etc.)
if [ -f "../.env" ]; then
  set -a
  . ../.env
  set +a
fi

echo ">> Starting backend via Maven..."
exec ./mvnw spring-boot:run
