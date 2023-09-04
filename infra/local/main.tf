terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.15.0"
    }
  }
}

module "codedang-infra" {
  source            = "../modules/codedang-infra"
  region            = var.region
  s3_bucket         = var.s3_bucket
  postgres_username = var.postgres_username
  postgres_port     = var.postgres_port
  redis_port        = var.redis_port
  rabbitmq_username = var.rabbitmq_username
  rabbitmq_port     = var.rabbitmq_port
}

module "codedang-tf-backend" {
  source = "../modules/codedang-tf-backend"
}
