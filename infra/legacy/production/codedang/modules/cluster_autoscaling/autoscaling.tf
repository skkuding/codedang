resource "aws_launch_template" "this" {
  name          = var.launch_template.name
  image_id      = "ami-05db432abf706dc01"
  instance_type = "t3a.small"
  key_name      = var.launch_template.key_name
  user_data = base64encode(templatefile("${path.module}/launch_template/user_data.sh", {
    cluster_name = aws_ecs_cluster.this.name
  }))

  iam_instance_profile {
    name = var.launch_template.iam_instance_profile_name
  }

  network_interfaces {
    security_groups = [aws_security_group.this.id]
  }

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = var.launch_template.tags_name
    }
  }
}


resource "aws_autoscaling_group" "this" {
  name                = var.autoscaling_group.name
  vpc_zone_identifier = [for key in keys(var.subnets) : aws_subnet.this[key].id]

  desired_capacity = var.autoscaling_group.desired_capacity
  min_size         = 1
  max_size         = var.autoscaling_group.max_size

  mixed_instances_policy {
    launch_template {
      launch_template_specification {
        launch_template_id = aws_launch_template.this.id
        version            = aws_launch_template.this.latest_version
      }
    }
  }

  lifecycle {
    create_before_destroy = true
  }

  tag {
    key                 = "AmazonECSManaged"
    value               = ""
    propagate_at_launch = true
  }

  protect_from_scale_in = true

}

resource "aws_autoscaling_policy" "this" {
  name                   = var.autoscaling_policy.name
  autoscaling_group_name = aws_autoscaling_group.this.name

  policy_type               = "TargetTrackingScaling"
  estimated_instance_warmup = 300

  target_tracking_configuration {
    target_value = var.autoscaling_policy.target_value
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }
  }
}

resource "aws_ecs_capacity_provider" "this" {
  name = var.ecs_capacity_provider_name
  auto_scaling_group_provider {
    auto_scaling_group_arn         = aws_autoscaling_group.this.arn
    managed_termination_protection = "ENABLED"

    managed_scaling {
      maximum_scaling_step_size = 5
      minimum_scaling_step_size = 1
      status                    = "ENABLED"
      target_capacity           = 100
    }
  }
}
