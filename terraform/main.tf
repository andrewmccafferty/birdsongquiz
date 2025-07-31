terraform {
  backend "s3" {
    bucket = "birdsongquiz-terraform-state-bucket"
    key    = "state/terraform.tfstate"
    region = "eu-west-2"
    dynamodb_table = null
    encrypt = true
  }
}

provider "aws" {
  region = var.aws_region
}

resource "aws_s3_bucket" "frontend_bucket" {
  bucket = var.environment == "prod" ? "birdsongquiz" : "birdsongquiz-${var.environment}"
}

resource "aws_s3_object" "birdsongquiz_frontend" {
  bucket = aws_s3_bucket.frontend_bucket.id

  key    = "dist/bundle.js"
  source = "../frontend/dist/bundle.js"

  etag = filemd5("../frontend/dist/bundle.js")
}

resource "aws_s3_bucket" "species_list_bucket" {
  bucket = var.environment == "prod" ? "species-list-bucket" : "${var.environment}-species-list-bucket"
}

resource "aws_s3_bucket_ownership_controls" "species_list_bucket" {
  bucket = aws_s3_bucket.species_list_bucket.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "species_list_bucket" {
  depends_on = [aws_s3_bucket_ownership_controls.species_list_bucket]

  bucket = aws_s3_bucket.species_list_bucket.id
  acl    = "private"
}

resource "aws_s3_bucket" "lambda_bucket" {
  bucket = var.environment == "prod" ? "birdsongquiz-bucket" : "birdsongquiz-bucket-${var.environment}"
}

resource "aws_s3_bucket_ownership_controls" "lambda_bucket" {
  bucket = aws_s3_bucket.lambda_bucket.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "lambda_bucket" {
  depends_on = [aws_s3_bucket_ownership_controls.lambda_bucket]

  bucket = aws_s3_bucket.lambda_bucket.id
  acl    = "private"
}


data "archive_file" "lambda_birdsongquiz" {
  type = "zip"

  source_dir  = "../api"
  output_path = "${path.module}/birdsongquiz_lambdas.zip"
}

resource "aws_s3_object" "lambda_birdsongquiz" {
  bucket = aws_s3_bucket.lambda_bucket.id

  key    = "birdsongquiz_lambdas.zip"
  source = data.archive_file.lambda_birdsongquiz.output_path

  etag = filemd5(data.archive_file.lambda_birdsongquiz.output_path)
}

resource "aws_lambda_function" "get_species_list" {
  function_name = var.environment == "prod" ? "GetSpeciesList" : "GetSpeciesList-${var.environment}" 
  timeout = 30
  s3_bucket = aws_s3_bucket.lambda_bucket.id
  s3_key    = aws_s3_object.lambda_birdsongquiz.key

  runtime = "nodejs20.x"
  handler = "handlers.getSpeciesList"

  source_code_hash = data.archive_file.lambda_birdsongquiz.output_base64sha256

  role = aws_iam_role.get_species_list_role.arn

   environment {
    variables = {
      SPECIES_LIST_BUCKET_NAME = aws_s3_bucket.species_list_bucket.id
    }
  }
}

resource "aws_cloudwatch_log_group" "get_species_list" {
  name = "/aws/lambda/${aws_lambda_function.get_species_list.function_name}"

  retention_in_days = 30
}

resource "aws_lambda_function" "get_recording" {
  function_name = var.environment == "prod" ? "GetRecording" : "GetRecording-${var.environment}"
  timeout = 30
  s3_bucket = aws_s3_bucket.lambda_bucket.id
  s3_key    = aws_s3_object.lambda_birdsongquiz.key

  runtime = "nodejs20.x"
  handler = "handlers.getRecording"

  source_code_hash = data.archive_file.lambda_birdsongquiz.output_base64sha256

  role = aws_iam_role.lambda_exec.arn
}

resource "aws_cloudwatch_log_group" "get_recording" {
  name = var.environment == "prod" ? "/aws/lambda/GetRecording" : "/aws/lambda/GetRecording-${var.environment}"

  retention_in_days = 30
}

resource "aws_iam_role" "lambda_exec" {
  name = var.environment == "prod" ? "serverless_lambda" : "serverless_lambda_${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Sid    = ""
      Principal = {
        Service = "lambda.amazonaws.com"
      }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_policy" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role" "get_species_list_role" {
  name = var.environment == "prod" ? "get_species_list" : "get_species_list_${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Sid    = ""
      Principal = {
        Service = "lambda.amazonaws.com"
      }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "species_list_attach_policy" {
  role       = aws_iam_role.get_species_list_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "species_list_s3_access" {
  name = "AllowS3AccessToMyBucket"
  role = aws_iam_role.get_species_list_role.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Resource = [
          "${aws_s3_bucket.species_list_bucket.arn}",
          "${aws_s3_bucket.species_list_bucket.arn}/*"
        ]
      }
    ]
  })
}


resource "aws_apigatewayv2_api" "lambda" {
  name          = var.environment == "prod" ? "serverless_lambda_gw" : "serverless_lambda_gw_${var.environment}"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_stage" "lambda" {
  api_id = aws_apigatewayv2_api.lambda.id

  name        = var.environment == "prod" ? "serverless_lambda_stage" : "serverless_lambda_stage_${var.environment}"
  auto_deploy = true

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


