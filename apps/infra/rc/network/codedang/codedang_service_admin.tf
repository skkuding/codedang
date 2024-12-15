data "aws_ecr_repository" "admin_api" {
  name = "codedang-admin-api"
}

module "admin_api_loadbalancer" {
  source = "./modules/loadbalancing"

  lb = {
    name = "Codedang-Admin-Api-LB"
    subnets = ["public1", "public2"]
  }

  lb_target_group = {
    name              = "Codedang-Admin-Api-TG"
    port              = 3000
    health_check_path = "/graphql"
  }

  security_groups = ["sg_admin"]
}

module "admin_api" {
  source = "./modules/service_autoscaling"

  #TODO
  task_definition = {
    family = "Codedang-Admin-Api"
    # memory = 950
    container_definitions = jsonencode([
      jsondecode(templatefile("container_definitions/admin_api.json", {
        ecr_uri                         = data.aws_ecr_repository.admin_api.repository_url,
        database_url                    = local.storage.db_url,
        redis_host                      = local.storage.redis_host,
        redis_port                      = var.redis_port,
        jwt_secret                      = var.jwt_secret,
        testcase_bucket_name            = local.storage.s3_testcase_bucket.name,
        testcase_access_key             = local.storage.testcase_access_key,
        testcase_secret_key             = local.storage.testcase_secret_access_key,
        media_bucket_name               = local.storage.s3_media_bucket.name,
        media_access_key                = local.storage.media_access_key,
        media_secret_key                = local.storage.media_secret_access_key,
        otel_exporter_otlp_endpoint_url = var.otel_exporter_otlp_endpoint_url,
        loki_url                        = var.loki_url,
      })),
      jsondecode(file("container_definitions/log_router.json"))
    ])
    execution_role_arn = aws_iam_role.ecs_task_execution_role.arn
  }

  ecs_service = {
    name          = "Codedang-Admin-Api-Service"
    cluster_arn   = module.codedang_api.ecs_cluster.arn
    desired_count = 1
    load_balancer = {
      container_name   = "Codedang-Admin-Api"
      container_port   = 3000
      target_group_arn = module.admin_api_loadbalancer.target_group_arn
    }
  }

  appautoscaling_target = {
    min_capacity = 1
    max_capacity = 8
    resource_id = {
      cluster_name = module.codedang_api.ecs_cluster.name
    }
  }

  scale_down = {
    cloudwatch_metric_alarm = {
      alarm_name        = "Codedang-Admin-Api-Service-Scale-Down-Alert"
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
      alarm_name        = "Codedang-Admin-Api-Service-Scale-Up-Alert"
      alarm_description = "This metric monitors task cpu utilization and scale up ecs service"
      threshold         = 120

      dimensions = {
        cluster_name = module.codedang_api.ecs_cluster.name
      }
    }
  }
}
