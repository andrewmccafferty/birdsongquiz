locals {
  lambda_runtime  = "nodejs24.x"
  lambda_zip_path = "${path.module}/birdsongquiz_lambdas.zip"

  lambdas = {
    get_preset_lists = {
      handler = "handlers.getSpeciesPresetLists"
      timeout = 30
      environment_variables = {
        SPECIES_LIST_BUCKET_NAME = aws_s3_bucket.species_list_bucket.id
      }
      role_name = "get_preset_lists"
    }
    get_species_list = {
      handler = "handlers.getSpeciesList"
      timeout = 30
      environment_variables = {
        SPECIES_LIST_BUCKET_NAME = aws_s3_bucket.species_list_bucket.id
      }
      role_name = "get_species_list_role"
    }
    get_recording = {
      handler = "handlers.getRecording"
      timeout = 30
      environment_variables = {
        XC_API_KEY = var.xc_api_key
      }
      role_name = "lambda_exec"
    }
    suggest_preset_list = {
      handler = "handlers.suggestPresetList"
      timeout = 30
      environment_variables = {
        SPECIES_LIST_BUCKET_NAME = aws_s3_bucket.species_list_bucket.id
      }
      role_name = "add_suggestion_role"
    }
    approve_preset_list = {
      handler = "handlers.approvePresetList"
      timeout = 30
      environment_variables = {
        SPECIES_LIST_BUCKET_NAME = aws_s3_bucket.species_list_bucket.id
        FRONTEND_BUCKET_NAME     = aws_s3_bucket.frontend_bucket.id
      }
      role_name = "approve_preset_list_role"
    }
    notify_preset_list_suggested = {
      handler = "handlers.notifyPresetListSuggested"
      timeout = 30
      environment_variables = {
        SHOULD_SEND_SUGGESTION_NOTIFICATION_EMAILS = var.environment == "prod" ? true : null
        SPECIES_LIST_BUCKET_NAME                   = aws_s3_bucket.species_list_bucket.id
        MAILER_SEND_API_KEY                        = var.mailer_send_api_key
        NOTIFICATIONS_FROM_EMAIL_ADDRESS           = var.notifications_from_email_address
        NOTIFICATIONS_TO_EMAIL_ADDRESS             = var.notifications_to_email_address
        API_BASE_URL                               = "https://${aws_apigatewayv2_api.lambda.id}.execute-api.eu-west-2.amazonaws.com/${aws_apigatewayv2_stage.lambda.name}"
      }
      role_name = "notify_preset_list_suggested_role"
    }
    send_feedback = {
      handler = "handlers.sendFeedback"
      timeout = 30
      environment_variables = {
        SHOULD_SEND_SUGGESTION_NOTIFICATION_EMAILS = var.environment == "prod" ? true : null
        MAILER_SEND_API_KEY                        = var.mailer_send_api_key
        NOTIFICATIONS_TO_EMAIL_ADDRESS             = var.notifications_to_email_address
      }
      role_name = "send_feedback_role"
    }
  }

  # Convert snake_case to PascalCase for function names
  lambda_function_names = {
    for key, config in local.lambdas :
    key => var.environment == "prod" ? replace(title(replace(key, "_", " ")), " ", "") : "${replace(title(replace(key, "_", " ")), " ", "")}-${var.environment}"
  }
}

resource "aws_s3_object" "lambda_birdsongquiz" {
  bucket = aws_s3_bucket.lambda_bucket.id

  key    = "birdsongquiz_lambdas.zip"
  source = local.lambda_zip_path

  etag = filemd5(local.lambda_zip_path)
}

resource "aws_lambda_function" "lambdas" {
  for_each = local.lambdas

  function_name = local.lambda_function_names[each.key]
  timeout       = each.value.timeout
  s3_bucket     = aws_s3_bucket.lambda_bucket.id
  s3_key        = aws_s3_object.lambda_birdsongquiz.key

  runtime = local.lambda_runtime
  handler = each.value.handler

  source_code_hash = filebase64sha256(local.lambda_zip_path)

  role = aws_iam_role.lambda_roles[each.key].arn

  environment {
    variables = each.value.environment_variables
  }
}

resource "aws_cloudwatch_log_group" "lambda_logs" {
  for_each = local.lambdas

  name = "/aws/lambda/${aws_lambda_function.lambdas[each.key].function_name}"

  retention_in_days = 30
}

resource "aws_lambda_permission" "allow_notify_lambda_s3_access" {
  statement_id  = "AllowExecutionFromS3"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambdas["notify_preset_list_suggested"].function_name
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.species_list_bucket.arn
}

resource "aws_s3_bucket_notification" "species_list_notification" {
  bucket = aws_s3_bucket.species_list_bucket.id

  lambda_function {
    lambda_function_arn = aws_lambda_function.lambdas["notify_preset_list_suggested"].arn
    events              = ["s3:ObjectCreated:*"]
    filter_prefix       = "suggestions/"
  }

  depends_on = [
    aws_lambda_permission.allow_notify_lambda_s3_access
  ]
}

resource "aws_iam_role" "lambda_roles" {
  for_each = local.lambdas

  name = var.environment == "prod" ? each.value.role_name : "${each.value.role_name}_${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Sid    = ""
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  for_each = local.lambdas

  role       = aws_iam_role.lambda_roles[each.key].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# S3 Access policies for lambdas that need them
resource "aws_iam_role_policy" "species_list_s3_access" {
  name = "AllowS3AccessToMyBucket"
  role = aws_iam_role.lambda_roles["get_species_list"].name

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
          aws_s3_bucket.species_list_bucket.arn,
          "${aws_s3_bucket.species_list_bucket.arn}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy" "get_preset_lists_s3_access" {
  name = "AllowS3AccessToMyBucket"
  role = aws_iam_role.lambda_roles["get_preset_lists"].name

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
          aws_s3_bucket.species_list_bucket.arn,
          "${aws_s3_bucket.species_list_bucket.arn}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy" "add_suggestion_s3_access" {
  name = "AllowS3AccessToMyBucket"
  role = aws_iam_role.lambda_roles["suggest_preset_list"].name

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

resource "aws_iam_role_policy" "approve_preset_list_s3_access" {
  name = "AllowS3AccessToMyBucket"
  role = aws_iam_role.lambda_roles["approve_preset_list"].name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        "Effect" : "Allow",
        "Action" : [
          "s3:ListBucket",
          "s3:GetBucketLocation"
        ],
        "Resource" : aws_s3_bucket.species_list_bucket.arn
      },
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:HeadObject"
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
          "s3:ListObject",
          "s3:DeleteObject"
        ]
        Resource = [
          "${aws_s3_bucket.species_list_bucket.arn}/suggestions/*"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy" "notify_preset_list_suggested_role_s3_access" {
  name = "AllowS3AccessToMyBucket"
  role = aws_iam_role.lambda_roles["notify_preset_list_suggested"].name

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