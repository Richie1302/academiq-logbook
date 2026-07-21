#!/bin/bash
set -e

echo "=== Installing pnpm ==="
npm install -g pnpm

echo "=== Installing dependencies ==="
pnpm install --no-frozen-lockfile

echo "=== Approving builds ==="
pnpm approve-builds --yes 2>/dev/null || true

echo "=== Building api-server ==="
cd artifacts/api-server
node build.mjs

echo "=== Build complete ==="
