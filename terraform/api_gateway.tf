resource "aws_apigatewayv2_api" "lambda" {
  name          = var.environment == "prod" ? "serverless_lambda_gw" : "serverless_lambda_gw_${var.environment}"
  protocol_type = "HTTP"
  cors_configuration {
    allow_origins = ["*"]
  }
}

resource "aws_apigatewayv2_stage" "lambda" {
  api_id = aws_apigatewayv2_api.lambda.id

  name        = var.environment == "prod" ? "serverless_lambda_stage" : "serverless_lambda_stage_${var.environment}"
  auto_deploy = true
  default_route_settings {
    throttling_rate_limit = 5
    throttling_burst_limit = 6
  }
  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gw.arn

    format = jsonencode({
      requestId               = "$context.requestId"
      sourceIp                = "$context.identity.sourceIp"
      requestTime             = "$context.requestTime"
      protocol                = "$context.protocol"
      httpMethod              = "$context.httpMethod"
      resourcePath            = "$context.resourcePath"
      routeKey                = "$context.routeKey"
      status                  = "$context.status"
      responseLength          = "$context.responseLength"
      integrationErrorMessage = "$context.integrationErrorMessage"
      }
    )
  }
}

resource "aws_apigatewayv2_integration" "get_recording" {
  api_id = aws_apigatewayv2_api.lambda.id

  integration_uri    = aws_lambda_function.get_recording.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_integration" "get_species_list" {
  api_id = aws_apigatewayv2_api.lambda.id

  integration_uri    = aws_lambda_function.get_species_list.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_integration" "get_preset_lists" {
  api_id = aws_apigatewayv2_api.lambda.id

  integration_uri    = aws_lambda_function.get_preset_lists.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_integration" "suggest_preset_list" {
  api_id = aws_apigatewayv2_api.lambda.id

  integration_uri    = aws_lambda_function.suggest_preset_list.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "get_recording" {
  api_id = aws_apigatewayv2_api.lambda.id

  route_key = "GET /recording"
  target    = "integrations/${aws_apigatewayv2_integration.get_recording.id}"
}

resource "aws_apigatewayv2_route" "get_species_list" {
  api_id = aws_apigatewayv2_api.lambda.id

  route_key = "GET /species"
  target    = "integrations/${aws_apigatewayv2_integration.get_species_list.id}"
}

resource "aws_apigatewayv2_route" "get_preset_lists" {
  api_id    = aws_apigatewayv2_api.lambda.id
  route_key = "GET /presets/{region}"

  target = "integrations/${aws_apigatewayv2_integration.get_preset_lists.id}"
}

resource "aws_apigatewayv2_route" "suggest_preset_list" {
  api_id    = aws_apigatewayv2_api.lambda.id
  route_key = "POST /presets/suggestion"

  target = "integrations/${aws_apigatewayv2_integration.suggest_preset_list.id}"
}

resource "aws_cloudwatch_log_group" "api_gw" {
  name = var.environment == "prod" ? "/aws/api_gw/serverless_lambda_gw" : "/aws/api_gw/serverless_lambda_gw_${var.environment}"

  retention_in_days = 30
}

resource "aws_lambda_permission" "api_gw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_recording.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.lambda.execution_arn}/*/*"
}

resource "aws_lambda_permission" "api_gw_call_species_list" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_species_list.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.lambda.execution_arn}/*/*"
}

resource "aws_lambda_permission" "api_gw_call_preset_list" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_preset_lists.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.lambda.execution_arn}/*/*"
}

resource "aws_lambda_permission" "api_gw_suggest_preset_list" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.suggest_preset_list.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.lambda.execution_arn}/*/*"
}