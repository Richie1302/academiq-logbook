#!/bin/bash
set -e

echo "=== Setting up build directory ==="
mkdir -p /tmp/render-build
cp -r . /tmp/render-build/
cd /tmp/render-build

echo "=== Creating npm-compatible package.json for api-server ==="
cat > artifacts/api-server/package.json << 'PKGJSON'
{
  "name": "@workspace/api-server",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "node ./build.mjs",
    "start": "node --enable-source-maps ./dist/index.mjs"
  },
  "dependencies": {
    "cookie-parser": "^1.4.7",
    "cors": "^2",
    "drizzle-orm": "^0.45.2",
    "express": "^5",
    "openai": "^6.36.0",
    "pino": "^9",
    "pino-http": "^10",
    "jsonwebtoken": "^9.0.2",
    "@supabase/supabase-js": "^2.49.0",
    "express-rate-limit": "^7.4.0",
    "helmet": "^8.0.0",
    "pg": "^8.13.3"
  },
  "devDependencies": {
    "@types/cookie-parser": "^1.4.10",
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.6",
    "@types/node": "^25.3.3",
    "@types/pg": "^8.11.11",
    "@types/jsonwebtoken": "^9.0.7",
    "esbuild": "^0.27.3",
    "esbuild-plugin-pino": "^2.3.3",
    "pino-pretty": "^13",
    "thread-stream": "3.1.0",
    "typescript": "^5.9.3"
  }
}
PKGJSON

echo "=== Copying workspace packages as local deps ==="
mkdir -p artifacts/api-server/node_modules/@workspace/api-zod/src
cp -r lib/api-zod/src/* artifacts/api-server/node_modules/@workspace/api-zod/src/
echo '{"name":"@workspace/api-zod","version":"0.0.0","type":"module","exports":{".":"./src/index.ts"}}' \
  > artifacts/api-server/node_modules/@workspace/api-zod/package.json

mkdir -p artifacts/api-server/node_modules/@workspace/db/src
cp -r lib/db/src/* artifacts/api-server/node_modules/@workspace/db/src/
echo '{"name":"@workspace/db","version":"0.0.0","type":"module","exports":{".":"./src/index.ts"}}' \
  > artifacts/api-server/node_modules/@workspace/db/package.json

echo "=== Installing npm dependencies ==="
cd artifacts/api-server
npm install --legacy-peer-deps

echo "=== Building ==="
node build.mjs

echo "=== Copying dist back ==="
cp -r dist /opt/render/project/src/artifacts/api-server/

echo "=== Build complete ==="
