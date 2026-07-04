#!/bin/sh
set -e

# Inside the API container, localhost/127.0.0.1 points at the API container itself.
# If the env still points at localhost (common for local .env files), rewrite it to
# the Docker service name `postgres` so the container resolves the database.
rewrite_localhost_to_postgres() {
  _url="$1"
  case "$_url" in
    *localhost*|*127.0.0.1*|*"::1"*)
      echo "Rewriting database host to 'postgres' for in-container resolution." >&2
      echo "$_url" | sed -e 's/localhost/postgres/g' -e 's/127\.0\.0\.1/postgres/g' -e 's/\[::1\]/postgres/g' -e 's/::1/postgres/g'
      ;;
    *) echo "$_url" ;;
  esac
}

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set." >&2
  exit 1
fi
DATABASE_URL=$(rewrite_localhost_to_postgres "$DATABASE_URL")
export DATABASE_URL

if [ -n "$DIRECT_URL" ]; then
  DIRECT_URL=$(rewrite_localhost_to_postgres "$DIRECT_URL")
  export DIRECT_URL
fi

DATABASE_URL="$DATABASE_URL" DIRECT_URL="${DIRECT_URL:-}" /tools/node_modules/.bin/prisma migrate deploy --schema=/tools/prisma/schema.prisma --config=/tools/prisma/prisma.config.ts
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
