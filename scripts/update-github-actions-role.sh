#!/bin/bash

# Check required environment variables
if [ -z "$AWS_ACCOUNT_ID" ]; then
  echo "Error: AWS_ACCOUNT_ID environment variable is required"
  exit 1
fi

if [ -z "$GITHUB_REPO" ]; then
  echo "Error: GITHUB_REPO environment variable is required (format: owner/repo)"
  exit 1
fi

# Create temporary trust policy with substituted values
TEMP_TRUST_POLICY=$(mktemp)
sed -e "s/AWS_ACCOUNT_ID/$AWS_ACCOUNT_ID/g" \
    -e "s|GITHUB_REPO|$GITHUB_REPO|g" \
    github-actions-role-trust-policy.json > "$TEMP_TRUST_POLICY"

# Create or update the IAM role for GitHub Actions
if aws iam get-role --role-name GitHubAction-AssumeRoleWithAction >/dev/null 2>&1; then
  echo "Role already exists, updating trust policy..."
  aws iam update-assume-role-policy \
    --role-name GitHubAction-AssumeRoleWithAction \
    --policy-document "file://$TEMP_TRUST_POLICY"
else
  echo "Creating new role..."
  aws iam create-role \
    --role-name GitHubAction-AssumeRoleWithAction \
    --assume-role-policy-document "file://$TEMP_TRUST_POLICY" \
    --description "Role for GitHub Actions to assume"
fi
    
aws iam put-role-policy \
  --role-name GitHubAction-AssumeRoleWithAction \
  --policy-name GithubActionPolicy \
  --policy-document file://github-actions-role.json

# Clean up temporary file
rm -f "$TEMP_TRUST_POLICY"