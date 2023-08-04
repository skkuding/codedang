terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.11.0"
    }
  }
}

module "codedang-infra" {
  source = "../modules/codedang-infra"

  region            = var.region
  s3_bucket         = var.s3_bucket
  postgres_username = var.postgres_username
  # postgres_password = var.postgres_password
  postgres_port     = var.postgres_port
  rabbitmq_username = var.rabbitmq_username
  # rabbitmq_password = var.rabbitmq_password
}

module "codedang-tf-backend" {
  source = "../modules/codedang-tf-backend"
}
