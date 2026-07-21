#!/bin/bash
set -e

echo "=== Using npx to run pnpm without global install ==="
npx --yes pnpm@9 install --no-frozen-lockfile --shamefully-hoist

echo "=== Building api-server ==="
cd artifacts/api-server
npx --yes pnpm@9 run build

echo "=== Build complete ==="
