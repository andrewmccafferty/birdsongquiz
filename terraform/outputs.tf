output "api_root" {
  description = "Base URL for the deployed API Gateway stage"
  value       = "https://${aws_apigatewayv2_api.lambda.id}.execute-api.eu-west-2.amazonaws.com/${aws_apigatewayv2_stage.lambda.name}"
}

output "frontend_bucket" {
  description = "Name of the S3 bucket that holds the frontend of the quiz"
  value = aws_s3_bucket.frontend_bucket.id
}

output "species_list_bucket" {
  description = "Name of the S3 bucket that holds species lists"
  value = aws_s3_bucket.species_list_bucket.id
}

output "frontend_url" {
  description = "Cloudfront URL for birdsong quiz website"
  value = "https://${aws_cloudfront_distribution.static_site.domain_name}"
}

output "approve_preset_list_lambda" {
  description = "Name of the preset list Lambda"
  value = aws_lambda_function.approve_preset_list.function_name
}