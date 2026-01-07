#!/usr/bin/env bash
set -euo pipefail

ENV_NAME="${ENV_NAME:?ENV_NAME must be set}"

TMP_VARS="$(mktemp)"

terraform providers schema -json \
| jq -r '
  .provider_schemas
  | to_entries[]
  | .value.module_schemas
  | to_entries[]
  | .value.variables
  | to_entries[]
  | map(select(.value.required == true))
  | .[]
  | select(.key != "environment")
  | "\(.key) = \"dummy\""
' > "$TMP_VARS"

terraform destroy -auto-approve \
  -input=false \
  -var "environment=$ENV_NAME" \
  -var-file="$TMP_VARS"

rm -f "$TMP_VARS"
