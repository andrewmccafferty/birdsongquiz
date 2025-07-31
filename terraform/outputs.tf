output "api_root" {
  description = "Base URL for the deployed API Gateway stage"
  value       = "https://${aws_apigatewayv2_api.lambda.id}.execute-api.eu-west-2.amazonaws.com/${aws_apigatewayv2_stage.lambda.name}/"
}

output "frontend_bucket" {
  description = "Name of the S3 bucket that holds the frontend of the quiz"
  value = aws_s3_bucket.frontend_bucket.id
}