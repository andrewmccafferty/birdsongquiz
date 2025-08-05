if [ -z "${SPECIES_LIST_BUCKET:-}" ]; then
  echo "Error: SPECIES_LIST_BUCKET environment variable is not set."
  exit 1
fi

if [ -z "$1" ]; then
  echo "Error: should specify region code"
  exit 1
fi

REGION_CODE=$1
FILE_PATH="../data/species_lists/countries/$REGION_CODE.json"

aws s3api put-object \
  --bucket "$SPECIES_LIST_BUCKET" \
  --key "$REGION_CODE.json" \
  --body $FILE_PATH \
  --content-md5 "$(openssl md5 -binary "$FILE_PATH" | base64)"