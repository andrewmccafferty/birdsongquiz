#!/usr/bin/env bash

# Usage: ./approve-preset-list.sh <suggestionId>

SUGGESTION_ID="$1"

if [ -z "$SUGGESTION_ID" ]; then
  echo "Error: suggestionId is required."
  echo "Usage: $0 <suggestionId>"
  exit 1
fi

aws lambda invoke \
  --function-name ApprovePresetList \
  --payload "$(printf '{"suggestionId":"%s"}' "$SUGGESTION_ID")" \
  --cli-binary-format raw-in-base64-out \
  /dev/stdout | jq .