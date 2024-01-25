###################### Subnet ######################
resource "aws_subnet" "private_client_api1" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = var.availability_zones[0]

  tags = {
    Name = "Codedang-Clinet-Api-Subnet1"
  }
}

resource "aws_subnet" "private_client_api2" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = var.availability_zones[2]

  tags = {
    Name = "Codedang-Clinet-Api-Subnet2"
  }
}

###################### Application Load Balancer ######################
resource "aws_lb" "client_api" {
  name               = "Codedang-Client-Api-LB"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.client_lb.id]
  subnets            = [aws_subnet.public_subnet1.id, aws_subnet.public_subnet2.id]
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
  name        = "Codedang-Client-Api-TG"
  target_type = "instance"
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

###################### ECS Service ######################
resource "aws_ecs_service" "client_api" {
  name                              = "Codedang-Client-Api-Service"
  cluster                           = aws_ecs_cluster.api.id
  task_definition                   = aws_ecs_task_definition.client_api.arn
  desired_count                     = 1
  launch_type                       = "EC2"
  health_check_grace_period_seconds = 300


  # EC2 기반의 ECS라 필요 없을듯
  # network_configuration {
  #   # assign_public_ip = true # awsvpc 모드라 ENI기반으로 작동해서 public ip 할당받는게 이상함.
  #   security_groups = [aws_security_group.client_ecs.id]
  #   subnets         = [aws_subnet.public_client_api1.id, aws_subnet.public_client_api2.id]
  # }

  load_balancer {
    target_group_arn = aws_lb_target_group.client_api.arn
    container_name   = "Codedang-Client-Api"
    container_port   = 4000
  }

  depends_on = [
    aws_lb_listener.api
  ]
}

data "aws_ecr_repository" "client_api" {
  name = "codedang-client-api"
}

###################### ECS Task Definition ######################
resource "aws_ecs_task_definition" "client_api" {
  family                   = "Codedang-Client-Api"
  requires_compatibilities = ["EC2"]
  network_mode             = "bridge"
  container_definitions = templatefile("${path.module}/backend/client-task-definition.tftpl", {
    task_name = "Codedang-Client-Api",
    # aurora-posrgresql
    # database_url      = "postgresql://${var.postgres_username}:${random_password.postgres_password.result}@${aws_rds_cluster.cluster.endpoint}:${var.postgres_port}/skkuding?schema=public",

    # posrgresql (free tier)
    database_url         = "postgresql://${var.postgres_username}:${random_password.postgres_password.result}@${aws_db_instance.db-test.endpoint}/skkuding?schema=public",
    ecr_uri              = data.aws_ecr_repository.client_api.repository_url,
    container_port       = 4000,
    cloudwatch_region    = var.region,
    redis_host           = aws_elasticache_cluster.db_cache.cache_nodes.0.address,
    redis_port           = var.redis_port,
    jwt_secret           = random_password.jwt_secret.result,
    nodemailer_from      = "Codedang <noreply@codedang.com>",
    rabbitmq_host        = "${aws_mq_broker.judge_queue.id}.mq.${var.region}.amazonaws.com",
    rabbitmq_port        = var.rabbitmq_port,
    rabbitmq_username    = var.rabbitmq_username,
    rabbitmq_password    = random_password.rabbitmq_password.result,
    rabbitmq_vhost       = rabbitmq_vhost.vh.name,
    github_client_id     = var.github_client_id,
    github_client_secret = var.github_client_secret,
    kakao_client_id      = var.kakao_client_id,
    kakao_client_secret  = var.kakao_client_secret,
  })

  execution_role_arn = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn      = aws_iam_role.ecs_task_role.arn

}
