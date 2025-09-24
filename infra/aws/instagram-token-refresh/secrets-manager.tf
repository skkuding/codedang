resource "aws_secretsmanager_secret" "instagram_token" {
  name = "Codedang-Instagram-Token"
}

resource "aws_secretsmanager_secret_rotation" "instagram_token" {
  secret_id           = aws_secretsmanager_secret.instagram_token.id
  rotation_lambda_arn = aws_lambda_function.update_instagram_token.arn

  rotation_rules {
    automatically_after_days = 30
  }
}

# NOTE: initial access token must be set manually
resource "aws_secretsmanager_secret_version" "instagram_token" {
  secret_id = aws_secretsmanager_secret.instagram_token.id
  secret_string = jsonencode({
    access_token = ""
  })
}

output "instagram_token_arn" {
  value = aws_secretsmanager_secret.instagram_token.arn
}
