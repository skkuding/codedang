locals {
  vpc_id = "vpc-0aa77aaba41d75afe"
}

# This idle ALB served the retired ECS admin API and is staged for removal.
resource "aws_lb" "admin_api" {
  name               = "Codedang-Admin-Api-LB"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.failover["admin"].id]
  subnets            = [aws_subnet.failover["public_1"].id, aws_subnet.failover["public_2"].id]

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}

# This idle ALB served the retired ECS client API and is staged for removal.
resource "aws_lb" "client_api" {
  name               = "Codedang-Client-Api-LB"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.failover["client"].id]
  subnets            = [aws_subnet.failover["public_1"].id, aws_subnet.failover["public_2"].id]

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}

# This empty target group belongs only to the retired admin ALB.
resource "aws_lb_target_group" "admin_api" {
  name        = "Codedang-Admin-Api-TG"
  port        = 3000
  protocol    = "HTTP"
  target_type = "instance"
  vpc_id      = local.vpc_id

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}

# This empty target group belongs only to the retired client ALB.
resource "aws_lb_target_group" "client_api" {
  name        = "Codedang-Client-Api-TG"
  port        = 4000
  protocol    = "HTTP"
  target_type = "instance"
  vpc_id      = local.vpc_id

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}

# This listener exposes the retired admin ALB and should be removed with it.
resource "aws_lb_listener" "admin_api" {
  load_balancer_arn = aws_lb.admin_api.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.admin_api.arn
  }

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}

# This listener exposes the retired client ALB and should be removed with it.
resource "aws_lb_listener" "client_api" {
  load_balancer_arn = aws_lb.client_api.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.client_api.arn
  }

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}
