FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

FROM base AS builder
WORKDIR /app
COPY pnpm-workspace.yaml package.json tsconfig.base.json pnpm-lock.yaml ./
COPY packages/types/package.json ./packages/types/
COPY apps/api/package.json ./apps/api/

RUN pnpm install --no-frozen-lockfile

COPY packages/types ./packages/types
COPY apps/api ./apps/api

# Build shared types package first (produces dist/ with .js + .d.ts)
WORKDIR /app/packages/types
RUN pnpm build

WORKDIR /app/apps/api
RUN pnpm db:generate
RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/types/package.json ./packages/types/
COPY apps/api/package.json ./apps/api/

RUN pnpm install --prod --no-frozen-lockfile

COPY --from=builder /app/packages/types ./packages/types
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY apps/api/docker-entrypoint.sh ./apps/api/docker-entrypoint.sh

WORKDIR /app/apps/api
RUN sed -i 's/\r$//' docker-entrypoint.sh && chmod +x docker-entrypoint.sh
RUN pnpm db:generate

EXPOSE 3021

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/server.js"]
