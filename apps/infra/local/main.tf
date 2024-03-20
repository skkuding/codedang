terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.41.0"
    }
  }
}

module "codedang-infra" {
  source               = "../modules/codedang-infra"
  region               = var.region
  postgres_username    = var.postgres_username
  postgres_port        = var.postgres_port
  redis_port           = var.redis_port
  rabbitmq_username    = var.rabbitmq_username
  rabbitmq_port        = var.rabbitmq_port
  github_client_id     = var.github_client_id
  github_client_secret = var.github_client_secret
  kakao_client_id      = var.kakao_client_id
  kakao_client_secret  = var.kakao_client_secret
  otel_url             = var.otel_url
  otel_port            = var.otel_port
}

module "codedang-tf-backend" {
  source = "../modules/codedang-tf-backend"
}
