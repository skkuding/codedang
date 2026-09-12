# No ECS cluster uses this API launch template, so it is staged for removal.
resource "aws_launch_template" "api" {
  name = "Codedang-LaunchTemplate-Api"

  depends_on = [
    aws_iam_instance_profile.ecs_container_instance,
    aws_security_group.failover["api"],
  ]

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}

# No ECS cluster uses this Iris launch template, so it is staged for removal.
resource "aws_launch_template" "iris" {
  name = "Codedang-LaunchTemplate-Iris"

  depends_on = [
    aws_iam_instance_profile.ecs_container_instance,
    aws_security_group.failover["iris"],
  ]

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}
