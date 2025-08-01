variable "aws_region" {
  description = "AWS region for all resources."

  type    = string
  default = "eu-west-2"
}

variable "environment" {
  description = "Environment name (e.g. 'prod', 'dev', or a branch name for ephemeral environments)."
  type        = string
}