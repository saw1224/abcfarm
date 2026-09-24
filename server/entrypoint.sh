#!/bin/sh
set -eu

if [ -z "${ADMIN_PASSWORD:-}" ]; then
  echo "Falta configurar ADMIN_PASSWORD en el archivo .env."
  exit 1
fi

APP_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
DATA_DIR=${DATA_DIR:-/data}

mkdir -p "$DATA_DIR"

if [ ! -f "$DATA_DIR/.migrations-0006" ]; then
  for migration in "$APP_DIR"/drizzle/*.sql; do
    node --import "$APP_DIR/scripts/sites-env.mjs" "$APP_DIR/node_modules/wrangler/bin/wrangler.js" d1 execute DB \
      --local \
      --config "$APP_DIR/dist/server/wrangler.json" \
      --persist-to "$DATA_DIR" \
      --file "$migration"
  done
  touch "$DATA_DIR/.migrations-0006"
fi

exec node --import "$APP_DIR/scripts/sites-env.mjs" "$APP_DIR/node_modules/wrangler/bin/wrangler.js" dev \
  --config "$APP_DIR/dist/server/wrangler.json" \
  --local \
  --persist-to "$DATA_DIR" \
  --ip 0.0.0.0 \
  --port 8080 \
  --inspector-port 0 \
  --var "ADMIN_EMAIL:${ADMIN_EMAIL:-admin@farmacia.mx}" \
  --var "ADMIN_PASSWORD:${ADMIN_PASSWORD}"
