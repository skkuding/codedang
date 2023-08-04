# Subnet
resource "aws_subnet" "public_admin_api1" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.3.0/24"
  availability_zone = var.availability_zones[0]

  tags = {
    Name = "Codedang-Admin-Api-Subnet1"
  }
}

resource "aws_subnet" "public_admin_api2" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.4.0/24"
  availability_zone = var.availability_zones[2]

  tags = {
    Name = "Codedang-Admin-Api-Subnet2"
  }
}

# Application Load Balancer
resource "aws_lb" "admin_api" {
  name               = "Codedang-Admin-Api-LB"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.admin_lb.id]
  subnets            = [aws_subnet.public_admin_api1.id, aws_subnet.public_admin_api2.id]
  enable_http2       = true
}

resource "aws_lb_listener" "admin_api" {
  load_balancer_arn = aws_lb.admin_api.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.admin_api.arn
  }
}

resource "aws_lb_target_group" "admin_api" {
  name        = "Codedang-Admin-Api-Target-Group"
  target_type = "ip"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id

  health_check {
    interval            = 30
    path                = "/graphql"
    healthy_threshold   = 3
    unhealthy_threshold = 3
    matcher             = "200-404"
  }
}

resource "aws_ecs_service" "admin_api" {
  name                              = "Codedang-Admin-Api-Service"
  cluster                           = aws_ecs_cluster.api.id
  task_definition                   = aws_ecs_task_definition.admin_api.arn
  desired_count                     = 2
  launch_type                       = "FARGATE"
  health_check_grace_period_seconds = 300


  network_configuration {
    assign_public_ip = true
    security_groups  = [aws_security_group.admin_ecs.id]
    subnets          = [aws_subnet.public_admin_api1.id, aws_subnet.public_admin_api2.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.admin_api.arn
    container_name   = "Codedang-Admin-Api"
    container_port   = 3000
  }

  depends_on = [
    aws_lb_listener.api
  ]
}

data "aws_ecr_repository" "admin_api" {
  name = "codedang-admin-api"
}

resource "aws_ecs_task_definition" "admin_api" {
  family                   = "Codedang-Admin-Api"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 512
  memory                   = 1024
  container_definitions = templatefile("${path.module}/backend/task-definition.tftpl", {
    task_name = "Codedang-Admin-Api",
    # aurora-posrgresql
    # database_url      = "postgresql://${var.postgres_username}:${random_password.postgres_password.result}@${aws_rds_cluster.cluster.endpoint}:${var.postgres_port}/skkuding?schema=public",

    # posrgresql (free tier)
    database_url      = "postgresql://${var.postgres_username}:${random_password.postgres_password.result}@${aws_db_instance.db-test.endpoint}/skkuding?schema=public",
    ecr_uri           = data.aws_ecr_repository.admin_api.repository_url,
    container_port    = 3000
    cloudwatch_region = var.region,
    redis_host        = aws_elasticache_replication_group.db_cache.configuration_endpoint_address
    redis_port        = var.redis_port,
    jwt_secret        = random_password.jwt_secret.result,
  })
  execution_role_arn = aws_iam_role.ecs_task_execution_role.arn

  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "ARM64"
  }
}
