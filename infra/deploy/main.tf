terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.31.0"
    }
  }

  backend "s3" {
    bucket         = "codedang-tf-state"
    key            = "terraform/terraform.tfstate"
    region         = "ap-northeast-2"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
    # 다른 profile 사용 시 -> terraform init -backend-config "profile=계정"
  }
}

module "codedang-infra" {
  source = "../modules/codedang-infra"

  region               = var.region
  s3_bucket            = var.s3_bucket
  postgres_username    = var.postgres_username
  postgres_port        = var.postgres_port
  redis_port           = var.redis_port
  rabbitmq_username    = var.rabbitmq_username
  rabbitmq_port        = var.rabbitmq_port
  github_client_id     = var.github_client_id
  github_client_secret = var.github_client_secret
  kakao_client_id      = var.kakao_client_id
  kakao_client_secret  = var.kakao_client_secret

}

# module "codedang-tf-backend" {
#   source = "../modules/codedang-tf-backend"
# }
