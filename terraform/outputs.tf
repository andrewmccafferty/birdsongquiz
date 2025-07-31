output "api_base_url" {
  description = "Base URL for the deployed API Gateway stage"
  value       = "https://${aws_apigatewayv2_api.lambda.api_id}.execute-api.${aws_apigatewayv2_api.lambda.region}.amazonaws.com/${aws_apigatewayv2_stage.lambda.name}/"
}