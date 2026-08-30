locals {
  legacy_ecs_log_groups = {
    admin_api  = "/aws/ecs/codedang-admin-api"
    client_api = "/aws/ecs/codedang-client-api"
    iris       = "/aws/ecs/codedang-iris"
  }
}

# These empty log groups remain from the retired ECS services.
resource "aws_cloudwatch_log_group" "legacy_ecs" {
  for_each = local.legacy_ecs_log_groups

  name              = each.value
  retention_in_days = 30

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}

import {
  for_each = local.legacy_ecs_log_groups
  to       = aws_cloudwatch_log_group.legacy_ecs[each.key]
  id       = each.value
}
