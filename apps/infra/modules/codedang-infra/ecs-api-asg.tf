###################### Capacity Provider ######################
resource "aws_ecs_capacity_provider" "ecs_capacity_provider_api" {
  name = "codedang-api-capacity-provider"
  auto_scaling_group_provider {
    auto_scaling_group_arn         = aws_autoscaling_group.asg_api.arn
    managed_termination_protection = "ENABLED"
  }
}

resource "aws_ecs_cluster_capacity_providers" "ecs_api" {
  cluster_name       = aws_ecs_cluster.api.name
  capacity_providers = [aws_ecs_capacity_provider.ecs_capacity_provider_api.name]
}

###################### Auto Scaling Group ######################
resource "aws_autoscaling_group" "asg_api" {
  name                  = "Codedang-AutoScalingGroup-Api"
  vpc_zone_identifier   = [aws_subnet.private_client_api1.id, aws_subnet.private_client_api2.id]
  protect_from_scale_in = false

  # target_group_arns = [aws_lb_target_group.client_api.id]
  health_check_type = "ELB"

  # Desired number of instances in the Autoscaling Group
  desired_capacity = 1
  # Minimum and maximum number of instances in the Autoscaling Group
  min_size = 1
  max_size = 10

  lifecycle {
    create_before_destroy = true
  }

  # mixed_instances_policy 섹션 추가 -> provider의 manged_termination_protection 이 enable 되었으므로, 추가적으로 해당 설정을 해주어야함.
  mixed_instances_policy {
    # ID of the launch template to use for launching instances in the Autoscaling Group
    launch_template {
      launch_template_specification {
        launch_template_id = aws_launch_template.ec2_template_api.id
        version            = "$Latest"
      }
    }
  }
}

resource "aws_autoscaling_policy" "asp_api" {
  name                   = "Codedang-AutoScalingPolicy-Api"
  autoscaling_group_name = aws_autoscaling_group.asg_api.name

  policy_type               = "TargetTrackingScaling"
  estimated_instance_warmup = 300

  target_tracking_configuration {
    target_value = 90
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }
  }
}

###################### Launch Template ######################
resource "aws_launch_template" "ec2_template_api" {
  name          = "Codedang-LaunchTemplate-Api"
  image_id      = "ami-05db432abf706dc01" # 한국
  instance_type = "t3a.small"             # 2vCPU, 2GiB Mem

  iam_instance_profile {
    name = aws_iam_instance_profile.ecs_container_instance_role.name
  }

  # 미리 만들어 놓아야 합니다.
  key_name = "codedang-ecs-api-instance"
  user_data = base64encode(templatefile("${path.module}/user-data.sh", {
    cluster_name = aws_ecs_cluster.api.name
  }))

  # Block device mappings for the instance
  # block_device_mappings {
  #   device_name = "/dev/sda1"

  #   ebs {
  #     volume_size = 8 # 최대 값 30
  #     volume_type = "gp2"
  #   }
  # }

  # Network interface configuration
  network_interfaces {
    security_groups = [aws_security_group.ecs_api.id]
  }

  # Tag specifications for the instance
  tag_specifications {
    resource_type = "instance"

    tags = {
      Name = "Codedang-ECS-API"
    }
  }
}
