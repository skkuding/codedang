# This configuration is attached only to the unused legacy RabbitMQ broker.
resource "aws_mq_configuration" "judge_queue" {
  name           = "Codedang-JudgeQueue-configuration"
  engine_type    = "RabbitMQ"
  engine_version = "3.13"
  data           = <<-EOT
    secure.management.http.headers.enabled = true
    consumer_timeout = 1800000
  EOT

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}

# This broker credential is retired after the iris-legacy consumer is removed.
resource "aws_secretsmanager_secret" "judge_queue" {
  name = "Codedang-JudgeQueue-Secret"

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}
