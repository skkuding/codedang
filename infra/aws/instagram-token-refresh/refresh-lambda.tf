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
  source_code_hash = archive_file.lambda_zip.output_base64sha256
  timeout          = 10

  depends_on = [archive_file.lambda_zip]
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

resource "aws_lambda_permission" "allow_secrets_manager" {
  statement_id  = "AllowExecutionFromSecretsManager"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.update_instagram_token.function_name
  principal     = "secretsmanager.amazonaws.com"
}
