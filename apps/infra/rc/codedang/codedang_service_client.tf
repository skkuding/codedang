data "aws_ecr_repository" "client_api" {
  name = "codedang-client-api"
}

# TODO: send log to grafana
resource "aws_cloudwatch_log_group" "client_api" {
  name              = "/aws/ecs/codedang-client-api"
  retention_in_days = 30

  tags = {
    Name        = "Codedang-Client-Api"
    Description = "Codedang Client Api log group"
  }
}

module "client_api_loadbalancer" {
  source = "./modules/loadbalancing"

  lb = {
    name    = "Codedang-Client-Api-LB"
    subnets = ["public1", "public2"]
  }

  lb_target_group = {
    name              = "Codedang-Client-Api-TG"
    port              = 4000
    health_check_path = "/api"
  }

  security_groups = ["sg_client"]
}

module "client_api" {
  source = "./modules/service_autoscaling"

  #TODO
  task_definition = {
    family = "Codedang-Client-Api"
    # memory = 950

    container_definitions = jsonencode([
      jsondecode(templatefile("container_definitions/client_api.json", {
        ecr_uri                         = data.aws_ecr_repository.client_api.repository_url,
        database_url                    = local.storage.db_url,
        redis_host                      = local.storage.redis_host,
        redis_port                      = var.redis_port,
        jwt_secret                      = var.jwt_secret,
        rabbitmq_host                   = local.storage.mq_host,
        rabbitmq_port                   = var.rabbitmq_port,
        rabbitmq_username               = var.rabbitmq_username,
        rabbitmq_password               = local.storage.mq_password,
        rabbitmq_vhost                  = rabbitmq_vhost.vh.name,
        rabbitmq_api_url                = local.storage.mq_api_url,
        github_client_id                = var.github_client_id,
        github_client_secret            = var.github_client_secret,
        kakao_client_id                 = var.kakao_client_id,
        kakao_client_secret             = var.kakao_client_secret,
        otel_exporter_otlp_endpoint_url = var.otel_exporter_otlp_endpoint_url,
        log_group_name                  = aws_cloudwatch_log_group.client_api.name,
        region                          = data.aws_region.current.name,
        testcase_bucket_name            = local.storage.s3_testcase_bucket.name,
      })),
    ])

    execution_role_arn = aws_iam_role.ecs_task_execution_role.arn
  }

  task_role = {
    iam_role = {
      name        = "Codedang-API-Task-Role"
      description = null
    }

    iam_policy = {
      name = "Codedang-Api-Ses-Send-Email"
      policy = jsonencode({
        Statement = [
          {
            Action = [
              "ses:SendRawEmail",
              "ses:SendEmail",
            ]
            Effect   = "Allow"
            Resource = "*"
          },
        ]
        Version = "2012-10-17"
      })
    }
  }

  ecs_service = {
    name          = "Codedang-Client-Api-Service"
    cluster_arn   = module.codedang_api.ecs_cluster.arn
    desired_count = 2
    load_balancer = {
      container_name   = "Codedang-Client-Api"
      container_port   = 4000
      target_group_arn = module.client_api_loadbalancer.target_group_arn
    }
  }

  appautoscaling_target = {
    min_capacity = 2
    max_capacity = 8
    resource_id = {
      cluster_name = module.codedang_api.ecs_cluster.name
    }
  }

  scale_down = {
    cloudwatch_metric_alarm = {
      alarm_name        = "Codedang-Client-Api-Service-Scale-Down-Alert"
      alarm_description = "This metric monitors task cpu utilization and scale down ecs service"

      datapoints_to_alarm = 10
      evaluation_periods  = 10
      threshold           = 50

      dimensions = {
        cluster_name = module.codedang_api.ecs_cluster.name
      }
    }
  }

  scale_up = {
    cloudwatch_metric_alarm = {
      alarm_name        = "Codedang-Client-Api-Service-Scale-Up-Alert"
      alarm_description = "This metric monitors task cpu utilization and scale up ecs service"
      threshold         = 120

      dimensions = {
        cluster_name = module.codedang_api.ecs_cluster.name
      }
    }
  }
}
