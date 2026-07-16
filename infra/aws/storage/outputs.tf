output "testcase_bucket" {
  value     = aws_s3_bucket.testcase
  sensitive = true
}

output "database_url" {
  value     = local.database_url
  sensitive = true
}

output "database_secret_arn" {
  value     = aws_secretsmanager_secret.database.arn
  sensitive = true
}
