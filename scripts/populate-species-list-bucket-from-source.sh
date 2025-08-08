#!/bin/bash

if [ -z "${SPECIES_LIST_BUCKET:-}" ]; then
  echo "Error: SPECIES_LIST_BUCKET environment variable is not set."
  exit 1
fi

BASE_DIR="../data/species_lists"

find "$BASE_DIR" -type f | while read -r FILE; do
  # Remove the base directory from the file path to get the S3 key
  S3_KEY="${FILE#$BASE_DIR/}"
  echo "Uploading $FILE to s3://$SPECIES_LIST_BUCKET/$S3_KEY"
  aws s3api put-object \
    --bucket "$SPECIES_LIST_BUCKET" \
    --key "$S3_KEY" \
    --body "$FILE" \
    --content-md5 "$(openssl md5 -binary "$FILE" | base64)"
done