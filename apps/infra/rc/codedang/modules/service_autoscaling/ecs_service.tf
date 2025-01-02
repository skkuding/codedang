resource "aws_ecs_task_definition" "this" {
  family                   = var.task_definition.family
  requires_compatibilities = ["EC2"]
  network_mode             = "bridge"
  cpu                      = var.task_definition.cpu
  memory                   = var.task_definition.memory
  container_definitions    = var.task_definition.container_definitions
  execution_role_arn       = var.task_definition.execution_role_arn
  task_role_arn            = try(aws_iam_role.task_role[0].arn, null)
}

resource "aws_ecs_service" "this" {
  name                 = var.ecs_service.name
  cluster              = var.ecs_service.cluster_arn
  task_definition      = aws_ecs_task_definition.this.family
  desired_count        = var.ecs_service.desired_count
  launch_type          = "EC2"
  force_new_deployment = true

  dynamic "load_balancer" {
    for_each = var.ecs_service.load_balancer != null ? [var.ecs_service.load_balancer] : []
    content {
      container_name   = load_balancer.value.container_name
      container_port   = load_balancer.value.container_port
      target_group_arn = load_balancer.value.target_group_arn
    }
  }
}