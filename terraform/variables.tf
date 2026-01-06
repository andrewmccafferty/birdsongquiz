variable "aws_region" {
  description = "AWS region for all resources."

  type    = string
  default = "eu-west-2"
}

variable "environment" {
  description = "Environment name (e.g. 'prod', 'dev', or a branch name for ephemeral environments)."
  type        = string
}

variable "acm_certificate_arn" {
  description = "Certificate used for frontend website"
  type = string
  default = ""
}

variable "xc_api_key" {
  description = "Xeno-Canto API key"
  type = string
}

variable "mailer_send_api_key" {
  description = "MailerSend API key"
  type = string
}

variable "notifications_from_email_address" {
  description = "The email address notifications will be sent from"
  type = string
}

variable "notifications_to_email_address" {
  description = "The email address notifications will be sent to"
  type = string
}

variable "cloudflare_secret_key" {
  description = "Key used to verify Cloudflare Turnstile submissions"
  type = string
}