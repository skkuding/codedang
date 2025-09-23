resource "aws_lb" "this" {
  name               = var.lb.name
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.this.id]
  subnets            = var.lb.subnets
  enable_http2       = true
}

resource "aws_lb_target_group" "this" {
  name        = var.lb_target_group.name
  target_type = "instance"
  port        = var.lb_target_group.port
  protocol    = "HTTP"
  vpc_id      = data.aws_vpc.main.id

  health_check {
    interval            = 30
    path                = var.lb_target_group.health_check_path
    healthy_threshold   = 3
    unhealthy_threshold = 3
    matcher             = "200-404"
  }
}

resource "aws_lb_listener" "this" {
  load_balancer_arn = aws_lb.this.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "forward"
    forward {
      target_group {
        arn    = aws_lb_target_group.this.arn
        weight = 1
      }
    }
  }
}
