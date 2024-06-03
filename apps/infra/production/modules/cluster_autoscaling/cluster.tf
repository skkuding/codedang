resource "aws_ecs_cluster" "this" {
  name = var.ecs_cluster_name
}
