output "db_url" {
  value     = "postgres://${aws_db_instance.postgres.username}:${random_password.postgres_password.result}@${aws_db_instance.postgres.address}:${aws_db_instance.postgres.port}/skkuding?schema=public"
  sensitive = true
}

output "redis_host" {
  value     = aws_elasticache_cluster.db_cache.cache_nodes[0].address
  sensitive = true
}

output "mq_host_id" {
  value     = aws_mq_broker.judge_queue.id
  sensitive = true
}

output "mq_api_url" {
  value     = aws_mq_broker.judge_queue.instances.0.console_url
  sensitive = true
}

output "mq_password" {
  value     = random_password.rabbitmq_password.result
  sensitive = true
}

output "s3_media_bucket" {
  value = {
    name = aws_s3_bucket.media.bucket
    arn  = aws_s3_bucket.media.arn
  }
  sensitive = true
}

output "s3_testcase_bucket" {
  value = {
    name = aws_s3_bucket.testcase.bucket
    arn  = aws_s3_bucket.testcase.arn
  }
  sensitive = true
}

output "media_access_key" {
  value = aws_iam_access_key.media.id
}

output "media_secret_access_key" {
  value     = aws_iam_access_key.media.secret
  sensitive = true
}

output "testcase_access_key" {
  value = aws_iam_access_key.testcase.id
}

output "testcase_secret_access_key" {
  value     = aws_iam_access_key.testcase.secret
  sensitive = true
}