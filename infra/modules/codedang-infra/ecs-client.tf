# Subnet
resource "aws_subnet" "public_client_api1" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = var.availability_zones[0]

  tags = {
    Name = "Codedang-Clinet-Api-Subnet1"
  }
}

resource "aws_subnet" "public_client_api2" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = var.availability_zones[2]

  tags = {
    Name = "Codedang-Clinet-Api-Subnet2"
  }
}

# Application Load Balancer
resource "aws_lb" "client_api" {
  name               = "Codedang-Client-Api-LB"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.client_lb.id]
  subnets            = [aws_subnet.public_client_api1.id, aws_subnet.public_client_api2.id]
  enable_http2       = true
}

resource "aws_lb_listener" "api" {
  load_balancer_arn = aws_lb.client_api.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.client_api.arn
  }
}

resource "aws_lb_target_group" "client_api" {
  name        = "Codedang-Client-Api-Target-Group"
  target_type = "ip"
  port        = 4000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id

  health_check {
    interval            = 30
    path                = "/api"
    healthy_threshold   = 3
    unhealthy_threshold = 3
    matcher             = "200-404"
  }
}

resource "aws_ecs_service" "client_api" {
  name                              = "Codedang-Client-Api-Service"
  cluster                           = aws_ecs_cluster.api.id
  task_definition                   = aws_ecs_task_definition.client_api.arn
  desired_count                     = 2
  launch_type                       = "FARGATE"
  health_check_grace_period_seconds = 300


  network_configuration {
    assign_public_ip = true
    security_groups  = [aws_security_group.client_ecs.id]
    subnets          = [aws_subnet.public_client_api1.id, aws_subnet.public_client_api2.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.client_api.arn
    container_name   = "Codedang-Client-Api"
    container_port   = 4000
  }

  depends_on = [
    aws_lb_listener.api
  ]
}

resource "aws_ecs_task_definition" "client_api" {
  family                   = "Codedang-Client-Api"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 512
  memory                   = 1024
  container_definitions = templatefile("${path.module}/backend/task-definition.tftpl", {
    task_name = "Codedang-Client-Api",
    # aurora-posrgresql
    # database_url      = "postgresql://${var.postgres_username}:${var.postgres_password}@${aws_rds_cluster.cluster.endpoint}:${var.postgres_port}/skkuding?schema=public",

    # posrgresql (free tier)
    database_url      = "postgresql://${var.postgres_username}:${var.postgres_password}@${aws_db_instance.db-test.endpoint}/skkuding?schema=public",
    ecr_uri           = var.ecr_client_uri,
    container_port    = 4000
    cloudwatch_region = var.region,
    redis_host        = aws_elasticache_replication_group.db_cache.configuration_endpoint_address
    redis_port        = var.redis_port,
  })
  execution_role_arn = aws_iam_role.ecs_task_execution_role.arn

  runtime_platform {
    operating_system_family = "LINUX"
  }
}
