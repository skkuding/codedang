#admin 용
resource "aws_launch_template" "ecs-codedang-template-admin" {
  # Name of the launch template
  name = "codedang-admin-template"

  # arm64기반 ecs 최적화 이미지 사용
  # image_id = "ami-01287572b99f45fc2" 한국
  image_id      = "ami-0879857690d02a38c" # 도쿄 az ami는 이것만 지원. 한국 az에서 바꿀것
  instance_type = "t4g.small"             # 2vCPU, 2GiB Mem

  # ecs에서 해당 템플릿을 사용하기 위한 설정. 인스턴스 시작을 위한 ECS IAM 프로필에 템플릿을 적용
  iam_instance_profile {
    name = aws_iam_instance_profile.codedang-ecs.name
  }

  # SSH key pair name for connecting to the instance
  # 미리 만들어 놓아야 합니다.
  key_name = "codedang-ecs-admin"

  user_data = data.template_cloudinit_config.api_config.rendered

  # Block device mappings for the instance
  block_device_mappings {
    device_name = "/dev/sda1"

    ebs {
      # Size of the EBS volume in GB
      volume_size = 8 # 최대 값 30

      # Type of EBS volume (General Purpose SSD in this case)
      volume_type = "gp2"
    }
  }

  # Network interface configuration
  network_interfaces {
    security_groups = [aws_security_group.admin_ecs.id]
  }

  # Tag specifications for the instance
  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "launch template for codedang-ecs-admin"
    }
  }
}

resource "aws_autoscaling_group" "codedang-asg-admin" {
  name                  = "codedang-autoscaling-group-admin"
  vpc_zone_identifier   = [aws_subnet.private_admin_api1.id, aws_subnet.private_admin_api2.id]
  protect_from_scale_in = true

  target_group_arns = [aws_lb_target_group.admin_api.id]
  health_check_type = "ELB"

  # Minimum and maximum number of instances in the Autoscaling Group
  min_size = 1
  max_size = 4
  # Desired number of instances in the Autoscaling Group
  desired_capacity = 1

  lifecycle {
    create_before_destroy = true
  }

  # mixed_instances_policy 섹션 추가 -> provider의 manged_termination_protection 이 enable 되었으므로, 추가적으로 해당 설정을 해주어야함.
  mixed_instances_policy {
    # ID of the launch template to use for launching instances in the Autoscaling Group
    launch_template {
      launch_template_specification {
        launch_template_id = aws_launch_template.ecs-codedang-template-admin.id
        version            = "$Latest"
      }
    }
  }
}


resource "aws_autoscaling_policy" "codedang-admin-asp" {
  name                   = "codedang-admin-aspolicy"
  autoscaling_group_name = aws_autoscaling_group.codedang-asg-admin.name

  policy_type               = "TargetTrackingScaling"
  estimated_instance_warmup = 300

  target_tracking_configuration {
    target_value = 90
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }
  }
}
