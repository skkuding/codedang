/* TAS-2763: Legacy ECS cluster output source is commented with the resources.
output "ecs_cluster" {
  value = aws_ecs_cluster.this
}
*/

output "ecs_cluster" {
  value = {
    arn  = "arn:aws:ecs:ap-northeast-2:219857217698:cluster/disabled"
    name = "disabled"
  }
}
