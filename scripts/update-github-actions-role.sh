aws iam put-role-policy \
  --role-name GitHubAction-AssumeRoleWithAction \
  --policy-name GithubActionPolicy \
  --policy-document file://github-actions-role.json