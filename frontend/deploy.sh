#!/bin/bash

set -euo pipefail

# 1. Check required env vars
if [ -z "${CURRENT_APP_VERSION:-}" ]; then
  echo "Error: CURRENT_APP_VERSION environment variable is not set."
  exit 1
fi

if [ -z "${API_ROOT:-}" ]; then
  echo "Error: API_ROOT environment variable is not set."
  exit 1
fi

if [ -z "${FRONTEND_BUCKET:-}" ]; then
  echo "Error: FRONTEND_BUCKET environment variable is not set."
  exit 1
fi

# 2. Build the app
echo "Running npm ci"
npm ci

echo "Running build with API_ROOT=$API_ROOT..."
API_ROOT="$API_ROOT" npm run build

# 3. Compute MD5 of bundle.js
BUNDLE_PATH="dist/bundle.js"
INDEX_PATH="index.html"

if [ ! -f "$BUNDLE_PATH" ]; then
  echo "Error: $BUNDLE_PATH not found after build."
  exit 1
fi

ETAG=$(openssl md5 -binary "$BUNDLE_PATH" | base64)

echo "📦 Uploading $BUNDLE_PATH to s3://$FRONTEND_BUCKET/dist/bundle.js with ETag: $ETAG"

# 4. Upload bundle.js with content-type and MD5
aws s3api put-object \
  --bucket "$FRONTEND_BUCKET" \
  --key "dist/bundle.js" \
  --body "$BUNDLE_PATH" \
  --content-type "application/javascript" \
  --content-md5 "$(openssl md5 -binary "$BUNDLE_PATH" | base64)"

# 5. Upload index.html
echo "📰 Uploading $INDEX_PATH to s3://$FRONTEND_BUCKET/index.html"

aws s3 cp "$INDEX_PATH" "s3://$FRONTEND_BUCKET/index.html" \
  --content-type "text/html"

echo "Upload complete."
