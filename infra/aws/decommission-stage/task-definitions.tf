locals {
  legacy_ecs_task_definitions = toset([
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Admin-Api:20",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Admin-Api:36",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Admin-Api:51",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Admin-Api:52",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Admin-Api:53",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Admin-Api:54",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Admin-Api:55",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Admin-Api:56",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Admin-Api:57",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Admin-Api:58",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Admin-Api:59",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Admin-Api:60",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Admin-Api:61",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Admin-Api:62",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Admin-Api:63",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Admin-Api:64",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Admin-Api:65",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Admin-Api:75",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Client-Api:33",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Client-Api:34",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Client-Api:35",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Client-Api:36",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Client-Api:38",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Client-Api:39",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Client-Api:40",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Client-Api:41",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Client-Api:42",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Client-Api:43",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Client-Api:44",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Client-Api:45",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Client-Api:46",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Client-Api:47",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Client-Api:48",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Client-Api:49",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Client-Api:50",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Client-Api:51",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Client-Api:52",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Client-Api:53",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Client-Api:54",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Client-Api:55",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Client-Api:56",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Client-Api:67",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Client-Api:80",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Client-Api:105",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Iris-Api:37",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Iris-Api:39",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Iris-Api:40",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Iris-Api:44",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Iris-Api:45",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Iris-Api:46",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Iris-Api:55",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Iris-Api:60",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/Codedang-Iris-Api:75",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/api-jaeger-test:1",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/api-jaeger-test:2",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/api-jaeger-test:3",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/api-jaeger-test:4",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/api-jaeger-test:5",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/api-jaeger-test:6",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/api-jaeger-test:7",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/api-jaeger-test:8",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/api-jaeger-test:9",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/api-jaeger-test:10",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/api-jaeger-test:11",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/api-jaeger-test:12",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/api-jaeger-test:13",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/api-jaeger-test:14",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/api-jaeger-test:15",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/api-jaeger-test:16",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/api-jaeger-test:17",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/api-jaeger-test:18",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/api-jaeger-test:19",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/api-jaeger-test:20",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/api-jaeger-test:21",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/datadog-agent-task:1",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/loki-fargate-task-definition:1",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/loki-fargate-task-definition:2",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/loki-fargate-task-definition:3",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/loki-fargate-task-definition:4",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/mini-test:1",
    "arn:aws:ecs:ap-northeast-2:219857217698:task-definition/mini-test:2",
  ])
}

# No ECS cluster remains in the account, so all active task definition revisions
# are staged together with the roles and log groups that they reference.
resource "aws_ecs_task_definition" "legacy" {
  for_each = local.legacy_ecs_task_definitions

  family = split(":", split("/", each.value)[1])[0]
  container_definitions = jsonencode([{
    name   = "terraform-import-placeholder"
    image  = "terraform-import-placeholder"
    memory = 128
  }])

  depends_on = [
    aws_cloudwatch_log_group.legacy_ecs,
    aws_iam_role.ecs_task_execution,
  ]

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}

import {
  for_each = local.legacy_ecs_task_definitions
  to       = aws_ecs_task_definition.legacy[each.value]
  id       = each.value
}
