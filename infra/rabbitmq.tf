resource "aws_subnet" "private_mq" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.20.0/24"
  availability_zone = var.availability_zones[0]

  tags = {
    Name = "Codedang-DB-Subnet1"
  }
}

resource "aws_mq_broker" "judge_queue" {
  broker_name = "Codedang_JudgeQueue"

  engine_type        = "RabbitMQ"
  engine_version     = "3.10.20"
  host_instance_type = "mq.t3.micro"
  subnet_ids         = [aws_subnet.private_mq.id]

  logs {
    general = true
  }

  user {
    username = "skkuding"
    password = "abcd12345678"
  }
}
