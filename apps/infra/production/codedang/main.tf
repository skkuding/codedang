terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~>5.0"
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

provider "rabbitmq" {
  endpoint = aws_mq_broker.judge_queue.instances.0.console_url
  username = var.rabbitmq_username
  password = random_password.rabbitmq_password.result
}
