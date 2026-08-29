FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

FROM base AS builder
WORKDIR /app
COPY pnpm-workspace.yaml package.json tsconfig.base.json pnpm-lock.yaml ./
COPY packages/types/package.json ./packages/types/
COPY apps/web/package.json ./apps/web/

RUN pnpm install --frozen-lockfile

COPY packages/types ./packages/types
COPY apps/web ./apps/web

WORKDIR /app/apps/web
RUN pnpm build

FROM caddy:2-alpine AS runner
COPY --from=builder /app/apps/web/dist /srv/web
EXPOSE 80
CMD ["caddy", "file-server", "--root", "/srv/web", "--listen", ":80"]
