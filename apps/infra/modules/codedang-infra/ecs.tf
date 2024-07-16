###################### ECS Cluster ######################
resource "aws_ecs_cluster" "api" {
  name = "Codedang-Api"
}

resource "aws_ecs_cluster" "iris" {
  name = "Codedang-Iris"
}
