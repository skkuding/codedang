output "testcase_bucket" {
  value     = aws_s3_bucket.testcase
  sensitive = true
}

output "database_url" {
  value     = "postgres://${aws_db_instance.postgres.username}:${random_password.postgres_password.result}@${aws_db_instance.postgres.address}:${aws_db_instance.postgres.port}/skkuding?schema=public"
  sensitive = true
}

output "database_secret_arn" {
  value     = aws_secretsmanager_secret.database.arn
  sensitive = true
}
