terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.72"
    }

    rabbitmq = {
      source  = "cyrilgdn/rabbitmq"
      version = "~>1.8"
    }
  }

  backend "s3" {
    bucket         = "codedang-tf-state"
    key            = "terraform/codedang.tfstate"
    region         = "ap-northeast-2"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}

provider "aws" {
  region = "ap-northeast-2"
}

# TODO: dependency problem might be happened.
# 초기 terraform init 시 aws_mq_broker가 존재하지 않아 provider 설정이 되지 않는 오류가 있습니다.
# solution. rabbitmq 프로젝트를 따로 분리해야 합니다요. endpoint는 variable로 전달.
provider "rabbitmq" {
  endpoint = aws_mq_broker.judge_queue.instances.0.console_url
  username = var.rabbitmq_username
  password = random_password.rabbitmq_password.result
}
