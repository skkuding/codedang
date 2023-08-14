#client 용
resource "aws_launch_template" "ecs-codedang-template-client" {
  # Name of the launch template
  name = "codedang-template-client"

  # arm64기반 ecs 최적화 이미지 사용
  image_id = "ami-01287572b99f45fc2"

  # ecs에서 해당 템플릿을 사용하기 위한 설정. 인스턴스 시작을 위한 ECS IAM 프로필에 템플릿을 적용
  iam_instance_profile {
    name = aws_iam_instance_profile.codedang-ecs.name
  }

  # Instance type for the EC2 instance
  instance_type = "t4g.small"

  # SSH key pair name for connecting to the instance
  key_name = "codedang-ecs-client"

  # Block device mappings for the instance
  block_device_mappings {
    device_name = "/dev/sda1"

    ebs {
      # Size of the EBS volume in GB
      volume_size = 30 # 최대 값 30

      # Type of EBS volume (General Purpose SSD in this case)
      volume_type = "gp2"
    }
  }

  # Network interface configuration
  network_interfaces {
    security_groups = [aws_security_group.client_ecs.id]
  }

  # Tag specifications for the instance
  tag_specifications {
    # Specifies the resource type as "instance"
    resource_type = "instance"

    # Tags to apply to the instance
    tags = {
      Name = "launch template for codedang-ecs-client"
    }
  }
}

resource "aws_autoscaling_group" "codedang-asg" {
  # Name of the Auto Scaling Group
  name                  = "codedang-autoscaling-group"
  vpc_zone_identifier   = [aws_subnet.public_client_api1.id, aws_subnet.public_client_api2.id]
  protect_from_scale_in = true

  # Desired number of instances in the Autoscaling Group
  desired_capacity = 1

  # Minimum and maximum number of instances in the Autoscaling Group
  min_size = 1
  max_size = 3

  lifecycle {
    create_before_destroy = true
  }


  # # Availability Zone(s) whe  re instances will be launched

  # availability_zones = ["ap-northeast-2a", "ap-northeast-2b"] # 실제 deploy에선 variable 처리


  # mixed_instances_policy 섹션 추가 -> provider의 manged_termination_protection 이 enable 되었으므로, 추가적으로 해당 설정을 해주어야함.
  mixed_instances_policy {
    # ID of the launch template to use for launching instances in the Autoscaling Group
    launch_template {
      launch_template_specification {
        launch_template_id = aws_launch_template.ecs-codedang-template-client.id
        version            = "$Latest"
      }
      override {
        instance_type     = "t4g.small"
        weighted_capacity = "1"
      }
    }
  }

}
