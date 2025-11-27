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

resource "aws_lambda_function" "get_preset_lists" {
  function_name = var.environment == "prod" ? "GetPresetLists" : "GetPresetLists-${var.environment}" 
  timeout = 30
  s3_bucket = aws_s3_bucket.lambda_bucket.id
  s3_key    = aws_s3_object.lambda_birdsongquiz.key

  runtime = "nodejs20.x"
  handler = "handlers.getSpeciesPresetLists"

  source_code_hash = data.archive_file.lambda_birdsongquiz.output_base64sha256

  role = aws_iam_role.get_preset_lists_role.arn

   environment {
    variables = {
      SPECIES_LIST_BUCKET_NAME = aws_s3_bucket.species_list_bucket.id
    }
  }
}

resource "aws_cloudwatch_log_group" "get_preset_lists" {
  name = "/aws/lambda/${aws_lambda_function.get_preset_lists.function_name}"

  retention_in_days = 30
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
  environment {
    variables = {
      XC_API_KEY = var.xc_api_key
    }
  }
  runtime = "nodejs20.x"
  handler = "handlers.getRecording"

  source_code_hash = data.archive_file.lambda_birdsongquiz.output_base64sha256

  role = aws_iam_role.lambda_exec.arn
}

resource "aws_cloudwatch_log_group" "get_recording" {
  name = var.environment == "prod" ? "/aws/lambda/GetRecording" : "/aws/lambda/GetRecording-${var.environment}"

  retention_in_days = 30
}

resource "aws_lambda_function" "suggest_preset_list" {
  function_name = var.environment == "prod" ? "SuggestPresetList" : "SuggestPresetList-${var.environment}"
  timeout = 30
  s3_bucket = aws_s3_bucket.lambda_bucket.id
  s3_key    = aws_s3_object.lambda_birdsongquiz.key
  environment {
    variables = {
      SPECIES_LIST_BUCKET_NAME = aws_s3_bucket.species_list_bucket.id
    }
  }
  runtime = "nodejs20.x"
  handler = "handlers.suggestPresetList"

  source_code_hash = data.archive_file.lambda_birdsongquiz.output_base64sha256

  role = aws_iam_role.add_suggestion_role.arn
}

resource "aws_cloudwatch_log_group" "suggest_preset_list" {
  name = var.environment == "prod" ? "/aws/lambda/SuggestPresetList" : "/aws/lambda/SuggestPresetList-${var.environment}"

  retention_in_days = 30
}

resource "aws_lambda_function" "notify_preset_list_suggested" {
  function_name = var.environment == "prod" ? "NotifyPresetListSuggested" : "NotifyPresetListSuggested-${var.environment}"
  timeout = 30
  s3_bucket = aws_s3_bucket.lambda_bucket.id
  s3_key    = aws_s3_object.lambda_birdsongquiz.key
  environment {
    variables = {
      SHOULD_SEND_SUGGESTION_NOTIFICATION_EMAILS = var.environment == "prod" ? true : null
      SPECIES_LIST_BUCKET_NAME = aws_s3_bucket.species_list_bucket.id
      MAILER_SEND_API_KEY = var.mailer_send_api_key
      NOTIFICATIONS_FROM_EMAIL_ADDRESS = var.notifications_from_email_address
      NOTIFICATIONS_TO_EMAIL_ADDRESS = var.notifications_to_email_address
    }
  }
  runtime = "nodejs20.x"
  handler = "handlers.notifyPresetListSuggested"

  source_code_hash = data.archive_file.lambda_birdsongquiz.output_base64sha256

  role = aws_iam_role.notify_preset_list_suggested_role.arn
}

resource "aws_lambda_permission" "allow_notify_lambda_s3_access" {
  statement_id  = "AllowExecutionFromS3"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.notify_preset_list_suggested.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.species_list_bucket.arn
}

resource "aws_s3_bucket_notification" "species_list_notification" {
  bucket = aws_s3_bucket.species_list_bucket.id

  lambda_function {
    lambda_function_arn = aws_lambda_function.notify_preset_list_suggested.arn
    events              = ["s3:ObjectCreated:*"]
    filter_prefix       = "suggestions/"
  }

  depends_on = [
    aws_lambda_permission.allow_notify_lambda_s3_access
  ]
}

resource "aws_lambda_function" "approve_preset_list" {
  function_name = var.environment == "prod" ? "ApprovePresetList" : "ApprovePresetList-${var.environment}"
  timeout = 30
  s3_bucket = aws_s3_bucket.lambda_bucket.id
  s3_key    = aws_s3_object.lambda_birdsongquiz.key
  environment {
    variables = {
      SPECIES_LIST_BUCKET_NAME = aws_s3_bucket.species_list_bucket.id
      FRONTEND_BUCKET_NAME = aws_s3_bucket.frontend_bucket.id
    }
  }
  runtime = "nodejs20.x"
  handler = "handlers.approvePresetList"

  source_code_hash = data.archive_file.lambda_birdsongquiz.output_base64sha256

  role = aws_iam_role.approve_preset_list_role.arn
}

resource "aws_cloudwatch_log_group" "approve_preset_list" {
  name = var.environment == "prod" ? "/aws/lambda/ApprovePresetList" : "/aws/lambda/ApprovePresetList-${var.environment}"

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

resource "aws_iam_role" "get_preset_lists_role" {
  name = var.environment == "prod" ? "get_preset_lists" : "get_preset_lists_${var.environment}"

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

resource "aws_iam_role_policy_attachment" "get_preset_lists_attach_policy" {
  role       = aws_iam_role.get_preset_lists_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "get_preset_lists_s3_access" {
  name = "AllowS3AccessToMyBucket"
  role = aws_iam_role.get_preset_lists_role.name

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

resource "aws_iam_role" "add_suggestion_role" {
  name = var.environment == "prod" ? "add_suggestion" : "add_suggestion_${var.environment}"

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

resource "aws_iam_role_policy_attachment" "add_suggestion_attach_policy" {
  role       = aws_iam_role.add_suggestion_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "add_suggestion_s3_access" {
  name = "AllowS3AccessToMyBucket"
  role = aws_iam_role.add_suggestion_role.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject"
        ]
        Resource = [
          "${aws_s3_bucket.species_list_bucket.arn}/suggestions/*"
        ]
      }
    ]
  })
}

resource "aws_iam_role" "approve_preset_list_role" {
  name = var.environment == "prod" ? "approve_preset_list" : "approve_preset_list_${var.environment}"

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

resource "aws_iam_role_policy_attachment" "approve_preset_list_attach_policy" {
  role       = aws_iam_role.approve_preset_list_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "approve_preset_list_s3_access" {
  name = "AllowS3AccessToMyBucket"
  role = aws_iam_role.approve_preset_list_role.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:ListObject"
        ]
        Resource = [
          "${aws_s3_bucket.species_list_bucket.arn}/presets/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject"
        ]
        Resource = [
          "${aws_s3_bucket.frontend_bucket.arn}/frontend-configuration.json"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:DeleteObject"
        ]
        Resource = [
          "${aws_s3_bucket.species_list_bucket.arn}/suggestions/*"
        ]
      }
    ]
  })
}

resource "aws_iam_role" "notify_preset_list_suggested_role" {
  name = var.environment == "prod" ? "notify_preset_list_suggested" : "notify_preset_list_suggested_${var.environment}"

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

resource "aws_iam_role_policy_attachment" "notify_preset_list_suggested_attach_policy" {
  role       = aws_iam_role.notify_preset_list_suggested_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "notify_preset_list_suggested_role_s3_access" {
  name = "AllowS3AccessToMyBucket"
  role = aws_iam_role.notify_preset_list_suggested_role.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject"
        ]
        Resource = [
          "${aws_s3_bucket.species_list_bucket.arn}/suggestions/*"
        ]
      }
    ]
  })
}