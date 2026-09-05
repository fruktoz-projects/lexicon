#!/bin/sh
set -e

echo "==> [Lexicon API] Synchronizing database schema with Prisma db push..."
pnpm db:push --skip-generate

echo "==> [Lexicon API] Checking initial database seed..."
pnpm db:seed || echo "==> [Lexicon API] Seed check completed or skipped."

echo "==> [Lexicon API] Starting server..."
exec "$@"
