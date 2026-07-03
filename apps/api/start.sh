#!/bin/sh
set -e

POSTGRES_HOST="${POSTGRES_HOST:-postgres}"

# Inside the API container, localhost points at the API container itself.
if [ "$POSTGRES_HOST" = "localhost" ] || [ "$POSTGRES_HOST" = "127.0.0.1" ] || [ "$POSTGRES_HOST" = "::1" ]; then
  echo "POSTGRES_HOST=$POSTGRES_HOST points at this container; using postgres instead."
  POSTGRES_HOST="postgres"
fi

# Assemble DATABASE_URL from Docker env parts so stale host-local values cannot win.
if [ -n "$POSTGRES_USER" ]; then
  export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}"
fi

/tools/node_modules/.bin/prisma migrate deploy --schema=/tools/prisma/schema.prisma --config=/tools/prisma/prisma.config.ts
NODE_PATH=/tools/node_modules /tools/node_modules/.bin/tsx packages/db/src/seed.ts

PUBLIC_DIR="/app/apps/api/public"
mkdir -p \
  "$PUBLIC_DIR/uploads" \
  "$PUBLIC_DIR/uploads/admin/settings" \
  "$PUBLIC_DIR/uploads/logo" \
  "$PUBLIC_DIR/uploads/about" \
  "$PUBLIC_DIR/uploads/favicon" \
  "$PUBLIC_DIR/uploads/branding"

exec node apps/api/server.js
