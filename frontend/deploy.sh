#!/bin/bash

set -euo pipefail

# Check required env vars
if [ -z "${CURRENT_APP_VERSION:-}" ]; then
  echo "Error: CURRENT_APP_VERSION environment variable is not set."
  exit 1
fi

if [ -z "${GOOGLE_ANALYTICS_ID:-}" ]; then
  echo "Error: GOOGLE_ANALYTICS_ID environment variable is not set."
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

echo "Running build with API_ROOT=$API_ROOT..."
API_ROOT="$API_ROOT" npm run build

# Compute MD5 of bundle.js
BUNDLE_PATH="dist/bundle.js"
INDEX_PATH="dist/index.html"
FRONTEND_CONFIGURATION_LOCAL_PATH="frontend-configuration.json"

if [ ! -f "$BUNDLE_PATH" ]; then
  echo "Error: $BUNDLE_PATH not found after build."
  exit 1
fi

ETAG=$(openssl md5 -binary "$BUNDLE_PATH" | base64)

echo "📦 Uploading $BUNDLE_PATH to s3://$FRONTEND_BUCKET/dist/bundle.js with ETag: $ETAG"

# Upload bundle.js with content-type and MD5
aws s3api put-object \
  --bucket "$FRONTEND_BUCKET" \
  --key "dist/bundle.js" \
  --body "$BUNDLE_PATH" \
  --content-type "application/javascript" \
  --content-md5 "$(openssl md5 -binary "$BUNDLE_PATH" | base64)"

# Upload index.html
echo "📰 Uploading $INDEX_PATH to s3://$FRONTEND_BUCKET/index.html"

aws s3 cp "$INDEX_PATH" "s3://$FRONTEND_BUCKET/index.html" \
  --content-type "text/html"

if ! aws s3api head-object --bucket "$FRONTEND_BUCKET" --key "frontend-configuration.json" >/dev/null 2>&1; then
  echo "frontend-configuration.json not found — uploading..."

  aws s3api put-object \
    --bucket "$FRONTEND_BUCKET" \
    --key "frontend-configuration.json" \
    --body "$FRONTEND_CONFIGURATION_LOCAL_PATH" \
    --content-type "application/json" \
    --content-md5 "$(openssl md5 -binary "$FRONTEND_CONFIGURATION_LOCAL_PATH" | base64)"

  echo "Upload complete."
else
  echo "frontend-configuration.json already exists — skipping upload."
fi
echo "Upload complete."
