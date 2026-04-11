#!/bin/bash
# Custom Azure App Service Deploy Script
# Umgeht die Oryx Auto-Detection (die fälschlicherweise Java erkennt)
# und führt nur den Node.js-Build aus.

set -e

echo "=== DiveLog Studio — Custom Deploy ==="
echo "Node: $(node --version)"
echo "NPM:  $(npm --version)"

DEPLOYMENT_SOURCE="${DEPLOYMENT_SOURCE:-/home/site/repository}"
DEPLOYMENT_TARGET="${DEPLOYMENT_TARGET:-/home/site/wwwroot}"

echo ">>> Installing dependencies..."
cd "$DEPLOYMENT_SOURCE"
npm ci --production=false

echo ">>> Building Next.js app..."
npm run build

echo ">>> Syncing to wwwroot..."
# Standalone-Output oder .next + public + package.json kopieren
if [ -d ".next/standalone" ]; then
  cp -rf .next/standalone/. "$DEPLOYMENT_TARGET/"
  cp -rf .next/static "$DEPLOYMENT_TARGET/.next/static" 2>/dev/null || true
  cp -rf public "$DEPLOYMENT_TARGET/public" 2>/dev/null || true
else
  # Kein Standalone: alles kopieren (außer node_modules + clients)
  rsync -a --delete \
    --exclude='node_modules' \
    --exclude='Clients' \
    --exclude='android' \
    --exclude='ios' \
    --exclude='electron' \
    --exclude='dist-electron' \
    --exclude='node-v20*' \
    --exclude='.git' \
    "$DEPLOYMENT_SOURCE/" "$DEPLOYMENT_TARGET/"

  echo ">>> Installing production dependencies in wwwroot..."
  cd "$DEPLOYMENT_TARGET"
  npm ci --production
fi

echo "=== Deploy complete ==="
