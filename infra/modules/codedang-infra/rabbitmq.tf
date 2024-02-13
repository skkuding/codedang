resource "aws_subnet" "private_mq" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.20.0/24"
  availability_zone = var.availability_zones[0]

  tags = {
    Name = "Codedang-MQ-Subnet1"
  }
}

resource "aws_mq_broker" "judge_queue" {
  broker_name = "Codedang-JudgeQueue"

  engine_type         = "RabbitMQ"
  engine_version      = "3.10.20"
  host_instance_type  = "mq.t3.micro"
  subnet_ids          = [aws_subnet.private_mq.id]
  publicly_accessible = true

  logs {
    general = true
  }

  user {
    username = var.rabbitmq_username
    password = random_password.rabbitmq_password.result
  }
}

# RabbitMQ Config
provider "rabbitmq" {
  # Configuration options
  endpoint = aws_mq_broker.judge_queue.instances.0.console_url
  username = var.rabbitmq_username
  password = random_password.rabbitmq_password.result
}

resource "rabbitmq_vhost" "vh" {
  name = "vh"
}

resource "rabbitmq_permissions" "vh_perm" {
  user  = var.rabbitmq_username
  vhost = rabbitmq_vhost.vh.name

  permissions {
    configure = ".*"
    write     = ".*"
    read      = ".*"
  }
}

# Make an Exchange
resource "rabbitmq_exchange" "exchange" {
  name  = var.rabbitmq_exchage_name
  vhost = rabbitmq_permissions.vh_perm.vhost

  settings {
    type    = "direct"
    durable = false
  }
}

# Make queues
resource "rabbitmq_queue" "result_queue" {
  name  = var.rabbitmq_result_queue_name
  vhost = rabbitmq_permissions.vh_perm.vhost

  settings {
    durable = true
  }
}
resource "rabbitmq_queue" "submission_queue" {
  name  = var.rabbitmq_consumer_queue_name
  vhost = rabbitmq_permissions.vh_perm.vhost

  settings {
    durable = true
  }
}

resource "rabbitmq_binding" "result_binding" {
  source           = rabbitmq_exchange.exchange.name
  vhost            = rabbitmq_vhost.vh.name
  destination      = rabbitmq_queue.result_queue.name
  destination_type = "queue"
  routing_key      = var.rabbitmq_result_routing_key
}

resource "rabbitmq_binding" "submission_binding" {
  source           = rabbitmq_exchange.exchange.name
  vhost            = rabbitmq_vhost.vh.name
  destination      = rabbitmq_queue.submission_queue.name
  destination_type = "queue"
  routing_key      = var.rabbitmq_submission_routing_key
}
