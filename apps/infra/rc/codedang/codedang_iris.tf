module "codedang_iris" {
  source = "./modules/cluster_autoscaling"

  launch_template = {
    name                      = "Codedang-LaunchTemplate-Iris"
    key_name                  = "codedang-ecs-iris-instance"
    iam_instance_profile_name = aws_iam_instance_profile.ecs_container_instance_profile.name
    tags_name                 = "Codedang-ECS-Iris"
  }

  autoscaling_group = {
    name             = "Codedang-AutoScalingGroup-Iris"
    max_size         = 4
    desired_capacity = 1
  }

  autoscaling_policy = {
    name         = "Codedang-AutoScalingPolicy-Iris"
    target_value = 80
  }

  ecs_cluster_name = "Codedang-Iris"

  ecs_capacity_provider_name = "codedang-capacity-provider-iris"

  subnets = ["private_iris1", "private_iris2"]

  security_groups = ["sg_ecs_iris"]
}
