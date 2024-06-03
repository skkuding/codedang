terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~>5.0"
    }
  }

}

provider "aws" {
  region = "ap-northeast-2"
}

resource "aws_appautoscaling_target" "this" {
  min_capacity       = var.appautoscaling_target.min_capacity
  max_capacity       = var.appautoscaling_target.max_capacity
  resource_id        = var.appautoscaling_target.resource_id
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}
