VAR_ARGS=$($HOME/go/bin/terraform-config-inspect --json . \
| jq -r '
  .variables
  | to_entries[]
  | select(.key != "environment")
  | select(.value.required == true)
  | "-var \"\(.key)=dummy\""
' | tr '\n' ' ')

terraform destroy -auto-approve \
  -input=false \
  -var "environment=$ENV_NAME" \
  $VAR_ARGS
