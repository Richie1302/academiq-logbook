#!/bin/bash
set -e

echo "=== Installing api-server dependencies ==="
cd artifacts/api-server
NODE_ENV=development npm install --legacy-peer-deps

echo "=== Building ==="
node build.mjs

echo "=== Build complete ==="
