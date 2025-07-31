output "api_base_url" {
  description = "Base URL for the deployed API Gateway stage"
  value       = "https://${aws_apigatewayv2_api.lambda.id}.execute-api.eu-west-2.amazonaws.com/${aws_apigatewayv2_stage.lambda.name}/"
}