terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.75"
    }
  }

}

provider "aws" {
  region = "ap-northeast-2"
}

data "terraform_remote_state" "network" {
  backend = "s3"
  config = {
    bucket = "codedang-tf-state-rc"
    key    = "terraform/network.tfstate"
    region = "ap-northeast-2"
  }
}

data "terraform_remote_state" "storage" {
  backend = "s3"
  config = {
    bucket = "codedang-tf-state-rc"
    key    = "terraform/storage.tfstate"
    region = "ap-northeast-2"
  }
}

locals {
  network = data.terraform_remote_state.network.outputs
  storage = data.terraform_remote_state.storage.outputs
}

resource "aws_appautoscaling_target" "this" {
  min_capacity       = var.appautoscaling_target.min_capacity
  max_capacity       = var.appautoscaling_target.max_capacity
  resource_id        = "service/${var.appautoscaling_target.resource_id.cluster_name}/${aws_ecs_service.this.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}
