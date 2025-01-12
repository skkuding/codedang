resource "random_password" "rabbitmq_password" {
  length  = 16
  special = false
}

resource "aws_mq_broker" "judge_queue" {
  broker_name = "Codedang-JudgeQueue"

  engine_type         = "RabbitMQ"
  engine_version      = "3.12.13"
  host_instance_type  = "mq.t3.micro"
  subnet_ids          = [local.network.mq_subnet_id]
  publicly_accessible = true

  logs {
    general = true
  }

  user {
    username = var.rabbitmq_username
    password = random_password.rabbitmq_password.result
  }
}
