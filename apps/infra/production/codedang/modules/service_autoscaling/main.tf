terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.59"
    }
  }

}

provider "aws" {
  region = "ap-northeast-2"
}

resource "aws_appautoscaling_target" "this" {
  min_capacity       = var.appautoscaling_target.min_capacity
  max_capacity       = var.appautoscaling_target.max_capacity
  resource_id        = "service/${var.appautoscaling_target.resource_id.cluster_name}/${aws_ecs_service.this.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}
