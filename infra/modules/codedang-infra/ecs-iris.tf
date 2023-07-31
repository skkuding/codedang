# Subnet
resource "aws_subnet" "private_iris1" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.41.0/24"
  availability_zone = var.availability_zones[0]

  tags = {
    Name = "Codedang-Iris-Subnet1"
  }
}

resource "aws_subnet" "private_iris2" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.42.0/24"
  availability_zone = var.availability_zones[2]

  tags = {
    Name = "Codedang-Iris-Subnet2"
  }
}


resource "aws_ecs_cluster" "iris" {
  name = "Codedang-Iris"
}

resource "aws_ecs_service" "iris" {
  name            = "Codedang-Iris-Service"
  cluster         = aws_ecs_cluster.iris.id
  task_definition = aws_ecs_task_definition.iris.arn
  desired_count   = 2
  launch_type     = "FARGATE"


  network_configuration {
    assign_public_ip = true
    security_groups  = [aws_security_group.iris.id]
    subnets          = [aws_subnet.private_iris1.id, aws_subnet.private_iris2.id]
  }
}


resource "aws_ecs_task_definition" "iris" {
  family                   = "Codedang-Iris-Api"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 512
  memory                   = 1024
  container_definitions = templatefile("${path.module}/iris/task-definition.tftpl", {
    ecr_uri              = var.ecr_iris_uri,
    rabbitmq_host_id     = aws_mq_broker.judge_queue.id,
    rabbitmq_host_region = var.region,
    rabbitmq_port        = var.rabbitmq_port,
    rabbitmq_username    = var.rabbitmq_username,
    rabbitmq_password    = var.rabbitmq_password,
    rabbitmq_vhost       = var.rabbitmq_vhost,
    cloudwatch_region    = var.region,
  })
  execution_role_arn = aws_iam_role.ecs_task_execution_role.arn

  runtime_platform {
    operating_system_family = "LINUX"
  }
}
