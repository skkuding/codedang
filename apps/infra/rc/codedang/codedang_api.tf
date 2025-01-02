module "codedang_api" {
  source = "./modules/cluster_autoscaling"

  launch_template = {
    name                      = "Codedang-LaunchTemplate-Api"
    key_name                  = "codedang-ecs-api-instance"
    iam_instance_profile_name = aws_iam_instance_profile.ecs_container_instance_profile.name
    tags_name                 = "Codedang-ECS-API"
  }

  autoscaling_group = {
    name             = "Codedang-AutoScalingGroup-Api"
    max_size         = 10
    desired_capacity = 1
  }

  autoscaling_policy = {
    name         = "Codedang-AutoScalingPolicy-Api"
    target_value = 70
  }

  ecs_cluster_name = "Codedang-Api"

  ecs_capacity_provider_name = "codedang-api-capacity-provider"

  subnets = ["private_api1", "private_api2"]

  security_groups = ["sg_ecs_api"]
}
