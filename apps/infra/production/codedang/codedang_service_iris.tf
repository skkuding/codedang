data "aws_ecr_repository" "iris" {
  name = "codedang-iris"
}

resource "aws_ecr_lifecycle_policy" "iris_repository_policy" {
  repository = data.aws_ecr_repository.iris.name
  policy     = <<EOF
    {
        "rules": [
        {
            "rulePriority": 1,
            "description": "Keep the last 2 multi-architecture sets (1 image index, 2 architecture images).",
            "selection": {
            "tagStatus": "any",
            "countType": "imageCountMoreThan",
            "countNumber": 6
            },
            "action": {
            "type": "expire"
            }
        }
        ]
    }
    EOF
}

module "iris" {
  source = "./modules/service_autoscaling"

  #TODO
  task_definition = {
    family = "Codedang-Iris-Api"
    cpu    = 512
    memory = 512

    container_definitions = jsonencode([
      jsondecode(templatefile("container_definitions/iris.json", {
        ecr_uri                         = data.aws_ecr_repository.iris.repository_url,
        database_url                    = var.database_url,
        rabbitmq_host                   = "${aws_mq_broker.judge_queue.id}.mq.ap-northeast-2.amazonaws.com",
        rabbitmq_port                   = var.rabbitmq_port,
        rabbitmq_username               = var.rabbitmq_username,
        rabbitmq_password               = random_password.rabbitmq_password.result,
        rabbitmq_vhost                  = rabbitmq_vhost.vh.name,
        otel_exporter_otlp_endpoint_url = var.otel_exporter_otlp_endpoint_url,
        loki_url                        = var.loki_url,
      })),
      jsondecode(file("container_definitions/log_router.json"))
    ])

    execution_role_arn = aws_iam_role.ecs_task_execution_role.arn
  }

  task_role = {
    iam_role = {
      name        = "Codedang-Iris-Task-Role"
      description = null
    }

    iam_policy = {
      name = "Codedang-Iris-Testcase-Access"
      policy = jsonencode({
        Statement = [
          {
            Action   = "s3:GetObject"
            Effect   = "Allow"
            Resource = ["${var.testcase_bucket_arn}/*"]
          },
        ]
        Version = "2012-10-17"
      })
    }
  }

  ecs_service = {
    name          = "Codedang-Iris-Service"
    cluster_arn   = module.codedang_iris.ecs_cluster.arn
    desired_count = 2
  }

  appautoscaling_target = {
    min_capacity = 2
    max_capacity = 4
    resource_id = {
      cluster_name = module.codedang_iris.ecs_cluster.name
    }
  }

  scale_down = {
    cloudwatch_metric_alarm = {
      alarm_name        = "Codedang-Iris-Service-Scale-Down-Alert"
      alarm_description = "This metric monitors ec2 cpu utilization and scale down ecs service"

      datapoints_to_alarm = 15
      evaluation_periods  = 15
      threshold           = 45

      dimensions = {
        cluster_name = module.codedang_iris.ecs_cluster.name
      }
    }
  }

  scale_up = {
    cloudwatch_metric_alarm = {
      alarm_name        = "Codedang-Iris-Service-Scale-Up-Alert"
      alarm_description = "This metric monitors ec2 cpu utilization and scale up ecs service"
      statistic         = "Average"
      threshold         = 60

      dimensions = {
        cluster_name = module.codedang_iris.ecs_cluster.name
      }
    }
  }
}
