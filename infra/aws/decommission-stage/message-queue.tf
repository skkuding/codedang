variable "mq_import_password" {
  description = "Non-secret placeholder required by the provider while importing the retired RabbitMQ broker."
  type        = string
  sensitive   = true
  default     = "terraform-import-placeholder"
}

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

# Kubernetes replaced this zero-traffic judge broker, so it is staged here.
resource "aws_mq_broker" "judge_queue" {
  broker_name                = "Codedang-JudgeQueue"
  engine_type                = "RabbitMQ"
  engine_version             = "3.13"
  host_instance_type         = "mq.t3.micro"
  publicly_accessible        = true
  auto_minor_version_upgrade = true
  subnet_ids                 = [aws_subnet.failover["mq"].id]

  configuration {
    id       = aws_mq_configuration.judge_queue.id
    revision = aws_mq_configuration.judge_queue.latest_revision
  }

  user {
    username = "skkuding"
    password = var.mq_import_password
  }

  depends_on = [aws_secretsmanager_secret.judge_queue]

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}

# This broker credential is retired after the live iris-legacy namespace is removed.
resource "aws_secretsmanager_secret" "judge_queue" {
  name = "Codedang-JudgeQueue-Secret"

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}
