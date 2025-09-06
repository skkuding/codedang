output "instagram_token_arn" {
  value = aws_secretsmanager_secret.instagram_token.arn
}

resource "aws_secretsmanager_secret" "instagram_token" {
  name = "Codedang-Instagram-Token"
}

resource "aws_secretsmanager_secret_version" "instagram_token" {
  secret_id = aws_secretsmanager_secret.instagram_token.id
  secret_string = jsonencode({
    access_token = var.instagram_access_token
  })
}

# as AWS Lambda requires .zip files, we need to create a zip archive of the lambda function code
resource "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = "${path.module}/refresh_instagram_token.mjs"
  output_path = "${path.module}/lambda.tmp.zip"
}

resource "aws_lambda_function" "update_instagram_token" {
  filename      = archive_file.lambda_zip.output_path
  function_name = "update-instagram-token"
  handler       = "refresh_instagram_token.handler"
  runtime       = "nodejs22.x"
  role          = aws_iam_role.lambda_exec.arn
  environment {
    variables = {
      SECRET_ARN = aws_secretsmanager_secret.instagram_token.arn
    }
  }
  source_code_hash = filebase64sha256(archive_file.lambda_zip.output_path)
  timeout          = 10
}

resource "aws_iam_role" "lambda_exec" {
  name = "Codedang-UpdateInstagramToken-Role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_role_policy" "lambda_secretsmanager" {
  role = aws_iam_role.lambda_exec.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:PutSecretValue",
          "secretsmanager:GetSecretValue"
        ]
        Resource = aws_secretsmanager_secret.instagram_token.arn
      }
    ]
  })
}

# technically the deadline of the token refresh is 60 days
# however for safety, we refresh it every 30 days
resource "aws_cloudwatch_event_rule" "every_30_days" {
  name                = "UpdateInstagramTokenEvery30Days"
  schedule_expression = "cron(0 0 1/30 * ? *)"
}

resource "aws_cloudwatch_event_target" "lambda" {
  rule      = aws_cloudwatch_event_rule.every_30_days.name
  target_id = "UpdateInstagramToken"
  arn       = aws_lambda_function.update_instagram_token.arn
}

resource "aws_lambda_permission" "allow_cloudwatch" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.update_instagram_token.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.every_30_days.arn
}
