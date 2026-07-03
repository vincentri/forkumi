FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ---- deps ----
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/admin/package.json ./packages/admin/
COPY packages/auth/package.json ./packages/auth/
COPY packages/crud/package.json ./packages/crud/
COPY packages/db/package.json ./packages/db/
COPY packages/email/package.json ./packages/email/
COPY packages/ui/package.json ./packages/ui/
COPY packages/tsconfig/package.json ./packages/tsconfig/
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --ignore-scripts

# ---- builder ----
FROM base AS builder
WORKDIR /app
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages/admin/node_modules ./packages/admin/node_modules
COPY --from=deps /app/packages/auth/node_modules ./packages/auth/node_modules
COPY --from=deps /app/packages/crud/node_modules ./packages/crud/node_modules
COPY --from=deps /app/packages/db/node_modules ./packages/db/node_modules
COPY --from=deps /app/packages/email/node_modules ./packages/email/node_modules
COPY --from=deps /app/packages/ui/node_modules ./packages/ui/node_modules
COPY apps/api ./apps/api
COPY packages/admin ./packages/admin
COPY packages/auth ./packages/auth
COPY packages/crud ./packages/crud
COPY packages/db ./packages/db
COPY packages/email ./packages/email
COPY packages/ui ./packages/ui
COPY packages/tsconfig ./packages/tsconfig
COPY package.json pnpm-workspace.yaml turbo.json ./
RUN PRISMA_GENERATE_SKIP_AUTOINSTALL=true packages/db/node_modules/.bin/prisma generate \
    --schema apps/api/prisma/schema.prisma
RUN pnpm --filter api build
# Standalone file tracing only captures statically-referenced files from pnpm vstore packages.
# Supplement the hollow vstore entries with their full contents so dynamic requires work at runtime.
RUN SWC_VSTORE=$(ls -d /app/node_modules/.pnpm/@swc+helpers@*/node_modules/@swc/helpers | head -1) && \
    SWC_TARGET=$(ls -d /app/apps/api/.next/standalone/node_modules/.pnpm/@swc+helpers@*/node_modules/@swc/helpers | head -1) && \
    cp -r "$SWC_VSTORE"/. "$SWC_TARGET/"
RUN PRISMA_VSTORE=$(ls -d /app/node_modules/.pnpm/@prisma+client@*/node_modules/.prisma/client | head -1) && \
    PRISMA_TARGET=$(ls -d /app/apps/api/.next/standalone/node_modules/.pnpm/@prisma+client@*/node_modules | head -1) && \
    cp -r "$PRISMA_VSTORE" "$PRISMA_TARGET/.prisma/client"

# ---- tools ----
FROM node:22-alpine AS tools
WORKDIR /tools
RUN --mount=type=cache,id=npm-tools,target=/root/.npm \
    npm install --save-exact \
      prisma@7.8.0 \
      tsx@4.19.3 \
      bcryptjs@2.4.3 \
      dotenv@16.4.7 \
      "@prisma/client@7.8.0" \
      "@prisma/adapter-pg@7.8.0" \
      "pg@8.21.0"
COPY apps/api/prisma ./prisma
RUN PRISMA_GENERATE_SKIP_AUTOINSTALL=true \
    node_modules/.bin/prisma generate --schema ./prisma/schema.prisma

# ---- runner ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# COPY follows symlinks automatically — pnpm vstore structure (.pnpm/) is preserved intact
COPY --from=builder /app/apps/api/.next/standalone ./
COPY --from=builder /app/apps/api/.next/static ./apps/api/.next/static
RUN mkdir -p apps/api/public && chown -R nextjs:nodejs apps/api/public

# Self-contained startup toolchain (prisma, tsx, bcryptjs — cached stage)
COPY --from=tools /tools/node_modules /tools/node_modules
COPY --from=tools /tools/prisma /tools/prisma

# Seed source
COPY --from=builder /app/packages/db/src ./packages/db/src

# Startup script (migrate + seed + server)
COPY apps/api/start.sh ./start.sh
RUN chmod +x start.sh

USER nextjs
EXPOSE 3001
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

CMD ["./start.sh"]
