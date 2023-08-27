###################### Launch Template ######################
resource "aws_launch_template" "ec2_template_iris" {
  name          = "Codedang-LaunchTemplate-Iris"
  image_id      = "ami-0879857690d02a38c" # image_id = "ami-01287572b99f45fc2" 한국
  instance_type = "t4g.small"             # 2vCPU, 2GiB Mem

  iam_instance_profile {
    name = aws_iam_instance_profile.ecs_container_instance_role.name
  }

  # 미리 만들어 놓아야 합니다.
  key_name  = "codedang-ecs-iris"
  user_data = data.template_cloudinit_config.iris_config.rendered

  # Block device mappings for the instance
  block_device_mappings {
    device_name = "/dev/sda1"

    ebs {
      volume_size = 8 # 최대 값 30
      volume_type = "gp2"
    }
  }

  # Network interface configuration
  network_interfaces {
    security_groups = [aws_security_group.iris.id]
  }

  # Tag specifications for the instance
  tag_specifications {
    resource_type = "instance"

    tags = {
      Name = "launch template for codedang-ecs-iris"
    }
  }
}

###################### Auto Scaling Group ######################
resource "aws_autoscaling_group" "asg_iris" {
  name                  = "Codedang-AutoScalingGroup-Iris"
  vpc_zone_identifier   = [aws_subnet.private_iris1.id, aws_subnet.private_iris2.id]
  protect_from_scale_in = true

  # Desired number of instances in the Autoscaling Group
  desired_capacity = 1
  # Minimum and maximum number of instances in the Autoscaling Group
  min_size = 1
  max_size = 4

  lifecycle {
    create_before_destroy = true
  }

  # mixed_instances_policy 섹션 추가 -> provider의 manged_termination_protection 이 enable 되었으므로, 추가적으로 해당 설정을 해주어야함.
  mixed_instances_policy {
    # ID of the launch template to use for launching instances in the Autoscaling Group
    launch_template {
      launch_template_specification {
        launch_template_id = aws_launch_template.ec2_template_iris.id
        version            = "$Latest"
      }
    }
  }
}
