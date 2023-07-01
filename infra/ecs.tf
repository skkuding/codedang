resource "aws_subnet" "proxy1" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "ap-northeast-2a"

  tags = {
    Name = "Codedang-Proxy-Subnet1"
  }
}

resource "aws_subnet" "proxy2" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "ap-northeast-2c"

  tags = {
    Name = "Codedang-Proxy-Subnet2"
  }
}

resource "aws_ecs_cluster" "proxy" {
  name = "Codedang-Proxy"
}

resource "aws_lb" "proxy" {
  name               = "Codedang-Proxy-Load-Balancer"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.allow_web.id]
  subnets            = [aws_subnet.proxy1.id, aws_subnet.proxy2.id]
  enable_http2       = true
}

resource "aws_lb_listener" "proxy" {
  load_balancer_arn = aws_lb.proxy.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.proxy.arn
  }
}

resource "aws_lb_target_group" "proxy" {
  name        = "Codedang-Proxy-Target-Group"
  target_type = "ip"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
}

resource "aws_ecs_service" "proxy" {
  name            = "Codedang-Proxy-Service"
  cluster         = aws_ecs_cluster.proxy.id
  task_definition = aws_ecs_task_definition.proxy.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    assign_public_ip = true
    security_groups  = [aws_security_group.allow_web.id]
    subnets          = [aws_subnet.proxy1.id, aws_subnet.proxy2.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.proxy.arn
    container_name   = "Codedang-Proxy"
    container_port   = 80
  }

  depends_on = [
    aws_lb_listener.proxy
  ]
}

resource "aws_ecs_task_definition" "proxy" {
  family                   = "Codedang-Proxy"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 512
  memory                   = 1024
  container_definitions    = file("proxy/task-definition.json")

  runtime_platform {
    operating_system_family = "LINUX"
  }
}
