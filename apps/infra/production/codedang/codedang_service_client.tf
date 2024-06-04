data "aws_ecr_repository" "client_api" {
  name = "codedang-client-api"
}

module "client_api_loadbalancer" {
  source = "../modules/loadbalancing"

  lb = {
    name = "Codedang-Client-Api-LB"
    subnets = [
      var.public_subnet1,
      var.public_subnet2
    ]
  }

  lb_target_group = {
    name              = "Codedang-Client-Api-TG"
    port              = 4000
    health_check_path = "/api"
  }

  security_group = {
    name      = "Codedang-SG-LB-Client"
    tags_name = "Codedang-SG-LB-Client"
  }
}

module "client_api" {
  source = "../modules/service_autoscaling"

  #TODO
  task_definition = {
    family = "Codedang-Client-Api"
    memory = 950

    container_definitions = jsonencode([
      jsondecode(templatefile("container_definitions/client_api.json", {
        ecr_uri                         = data.aws_ecr_repository.client_api.repository_url,
        database_url                    = var.database_url,
        redis_host                      = "",
        redis_port                      = "",
        jwt_secret                      = "",
        rabbitmq_host                   = "",
        rabbitmq_port                   = "",
        rabbitmq_username               = "",
        rabbitmq_password               = "",
        rabbitmq_vhost                  = "",
        rabbitmq_api_url                = "",
        github_client_id                = "",
        github_client_secret            = "",
        kakao_client_id                 = "",
        kakao_client_secret             = "",
        otel_exporter_otlp_endpoint_url = "",
        loki_url                        = "",
      })),
      jsondecode(file("container_definitions/log_router.json"))
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
            Resource = "*"
          },
        ]
        Version = "2012-10-17"
      })
    }
  }

  ecs_service = {
    name          = "Codedang-Client-Api-Service"
    cluster_arn   = module.api.ecs_cluster.arn
    desired_count = 1
  }

  appautoscaling_target = {
    min_capacity = 1
    max_capacity = 8
    resource_id  = "service/Codedang-Api/Codedang-Client-Api-Service"
  }

  scale_down = {
    cloudwatch_metric_alarm = {
      alarm_name        = "Codedang-Client-Api-Service-Scale-Down-Alert"
      alarm_description = "This metric monitors task cpu utilization and scale down ecs service"

      datapoints_to_alarm = 10
      evaluation_periods  = 10
      threshold           = 50

      dimensions = {
        cluster_name = module.api.ecs_cluster.name
      }
    }
  }

  scale_up = {
    cloudwatch_metric_alarm = {
      alarm_name        = "Codedang-Client-Api-Service-Scale-Up-Alert"
      alarm_description = "This metric monitors task cpu utilization and scale up ecs service"
      threshold         = 120

      dimensions = {
        cluster_name = module.api.ecs_cluster.name
      }
    }
  }
}