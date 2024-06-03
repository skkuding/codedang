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
