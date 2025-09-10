data "aws_vpc" "main" {
  tags = {
    Name = "Codedang-VPC"
  }
}

resource "random_password" "rabbitmq_password" {
  length  = 16
  special = false
}

resource "aws_subnet" "private_mq" {
  vpc_id            = data.aws_vpc.main.id
  cidr_block        = "10.0.20.0/24"
  availability_zone = "ap-northeast-2a"

  tags = {
    Name = "Codedang-MQ-Subnet1"
  }
}

resource "aws_mq_broker" "judge_queue" {
  broker_name = "Codedang-JudgeQueue"

  engine_type                = "RabbitMQ"
  engine_version             = "3.13"
  auto_minor_version_upgrade = true

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

# Secret to share with on-premise kubernetes cluster
resource "aws_secretsmanager_secret" "judge_queue" {
  name = "Codedang-JudgeQueue-Secret"
}

resource "aws_secretsmanager_secret_version" "judge_queue" {
  secret_id = aws_secretsmanager_secret.judge_queue.id
  secret_string = jsonencode({
    username = var.rabbitmq_username
    password = random_password.rabbitmq_password.result
    api_url  = aws_mq_broker.judge_queue.instances.0.console_url,
    host     = trimprefix(aws_mq_broker.judge_queue.instances.0.console_url, "https://"),
    port     = var.rabbitmq_port,
    vhost    = rabbitmq_vhost.vh.name
  })
}
