resource "aws_subnet" "public_api1" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = var.availability_zones[0]

  tags = {
    Name = "Codedang-Api-Subnet1"
  }
}

resource "aws_subnet" "public_api2" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = var.availability_zones[2]

  tags = {
    Name = "Codedang-Api-Subnet2"
  }
}

resource "aws_ecs_cluster" "api" {
  name = "Codedang-Api"
}

resource "aws_lb" "api" {
  name               = "Codedang-Api-Load-Balancer"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.lb.id]
  subnets            = [aws_subnet.public_api1.id, aws_subnet.public_api2.id]
  enable_http2       = true
}

resource "aws_lb_listener" "api" {
  load_balancer_arn = aws_lb.api.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }
}

resource "aws_lb_target_group" "api" {
  name        = "Codedang-Api-Target-Group"
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

resource "aws_ecs_service" "api" {
  name                              = "Codedang-Api-Service"
  cluster                           = aws_ecs_cluster.api.id
  task_definition                   = aws_ecs_task_definition.api.arn
  desired_count                     = 2
  launch_type                       = "FARGATE"
  health_check_grace_period_seconds = 300


  network_configuration {
    assign_public_ip = true
    security_groups  = [aws_security_group.ecs.id]
    subnets          = [aws_subnet.public_api1.id, aws_subnet.public_api2.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "Codedang-Api"
    container_port   = 4000
  }

  depends_on = [
    aws_lb_listener.api
  ]
}


data "aws_iam_policy_document" "ecs_task_execution_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ecs_task_execution_role" {
  name               = "Codedang-Api-Task-Execution-Role"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_execution_role.json
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}


resource "aws_ecs_task_definition" "api" {
  family                   = "Codedang-Api"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 512
  memory                   = 1024
  container_definitions = templatefile("backend/task-definition.json", {
    # aurora-posrgresql
    # database_url      = "postgresql://${var.postgres_username}:${var.postgres_password}@${aws_rds_cluster.cluster.endpoint}:${var.postgres_port}/skkuding?schema=public",

    # posrgresql (free tier)
    database_url      = "postgresql://${var.postgres_username}:${var.postgres_password}@${aws_db_instance.db-test.endpoint}/skkuding?schema=public",
    ecr_uri           = var.ecr_uri,
    cloudwatch_region = var.region,
    redis_host        = aws_elasticache_replication_group.db_cache.configuration_endpoint_address
    redis_port        = var.redis_port,
  })
  execution_role_arn = aws_iam_role.ecs_task_execution_role.arn

  runtime_platform {
    operating_system_family = "LINUX"
  }
}
