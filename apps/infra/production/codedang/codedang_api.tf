module "codedang_api" {
  source = "./modules/cluster_autoscaling"

  launch_template = {
    name                      = "Codedang-LaunchTemplate-Api"
    key_name                  = "codedang-ecs-api-instance"
    iam_instance_profile_name = aws_iam_instance_profile.ecs_container_instance_profile.name
    tags_name                 = "Codedang-ECS-API"
  }

  autoscaling_group = {
    name     = "Codedang-AutoScalingGroup-Api"
    max_size = 10
    desired_capacity = 2
  }

  autoscaling_policy = {
    name         = "Codedang-AutoScalingPolicy-Api"
    target_value = 70
  }

  ecs_cluster_name = "Codedang-Api"

  ecs_capacity_provider_name = "codedang-api-capacity-provider"

  subnets = {
    private_api1 = {
      cidr_block        = "10.0.1.0/24"
      availability_zone = "ap-northeast-2a"
      tags_name         = "Codedang-Api-Subnet1"
    }

    private_api2 = {
      cidr_block        = "10.0.2.0/24"
      availability_zone = "ap-northeast-2c"
      tags_name         = "Codedang-Api-Subnet2"
    }
  }

  security_group = {
    name        = "Codedang-SG-ECS-Api"
    description = "Allow ECS inbound traffic"
    tags_name   = "Codedang-SG-ECS-API"

    ingress = {
      description = "From ALB"
      from_port   = 32768
      to_port     = 65535
      protocol    = "tcp"

      security_groups = [
        module.admin_api_loadbalancer.security_group_id,
        module.client_api_loadbalancer.security_group_id
      ]
    }
  }
}
