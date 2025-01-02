terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.75"
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

provider "rabbitmq" {
  endpoint = local.storage.mq_api_url
  username = var.rabbitmq_username
  password = local.storage.mq_password
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