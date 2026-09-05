FROM node:22-alpine
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

COPY pnpm-workspace.yaml package.json tsconfig.base.json pnpm-lock.yaml ./
COPY packages/types/package.json ./packages/types/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

RUN pnpm install --no-frozen-lockfile

COPY packages/types ./packages/types
COPY apps/web ./apps/web

WORKDIR /app/packages/types
RUN pnpm build

WORKDIR /app/apps/web
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "preview", "--host", "0.0.0.0", "--port", "3000"]
