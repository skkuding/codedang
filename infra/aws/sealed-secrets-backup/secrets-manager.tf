resource "aws_secretsmanager_secret" "sealed_secrets_prod" {
  name = "Codedang-Sealed-Secrets-Prod"
}

resource "aws_secretsmanager_secret_version" "sealed_secrets_prod" {
  secret_id     = aws_secretsmanager_secret.sealed_secrets_prod.id
  secret_string = "{}"

  lifecycle {
    # backup CronJob will update this value, ignore changes to avoid unnecessary diffs
    ignore_changes = [secret_string]
  }
}

resource "aws_secretsmanager_secret" "sealed_secrets_stage" {
  name = "Codedang-Sealed-Secrets-Stage"
}

resource "aws_secretsmanager_secret_version" "sealed_secrets_stage" {
  secret_id     = aws_secretsmanager_secret.sealed_secrets_stage.id
  secret_string = "{}"

  lifecycle {
    ignore_changes = [secret_string]
  }
}

output "sealed_secrets_prod_arn" {
  value = aws_secretsmanager_secret.sealed_secrets_prod.arn
}

output "sealed_secrets_stage_arn" {
  value = aws_secretsmanager_secret.sealed_secrets_stage.arn
}
