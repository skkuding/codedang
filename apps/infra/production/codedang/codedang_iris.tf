
module "codedang_iris" {
  source = "../modules/cluster_autoscaling"

  launch_template = {
    name                      = "Codedang-LaunchTemplate-Iris"
    key_name                  = "codedang-ecs-iris-instance"
    iam_instance_profile_name = aws_iam_instance_profile.ecs_container_instance_profile.name
    tags_name                 = "Codedang-ECS-Iris"
  }

  autoscaling_group = {
    name     = "Codedang-AutoScalingGroup-Iris"
    max_size = 4
  }

  autoscaling_policy = {
    name         = "Codedang-AutoScalingPolicy-Iris"
    target_value = 80
  }

  ecs_cluster_name = "Codedang-Iris"

  ecs_capacity_provider_name = "codedang-capacity-provider-iris"

  subnets = {
    private_iris1 = {
      cidr_block        = "10.0.41.0/24"
      availability_zone = "ap-northeast-2a"
      tags_name         = "Codedang-Iris-Subnet1"
    }

    private_iris2 = {
      cidr_block        = "10.0.42.0/24"
      availability_zone = "ap-northeast-2c"
      tags_name         = "Codedang-Iris-Subnet2"
    }
  }

  security_group = {
    name        = "Codedang-SG-Iris"
    description = "Allow Message Queue inbound traffic"
    tags_name   = "Codedang-SG-Iris"

    ingress = {
      description = "Iris"
      from_port   = var.rabbitmq_port
      to_port     = var.rabbitmq_port
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }
}
