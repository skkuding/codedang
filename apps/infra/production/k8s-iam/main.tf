terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.100"
    }
  }

  backend "s3" {
    bucket         = "codedang-tf-state"
    key            = "terraform/k8s-iam.tfstate"
    region         = "ap-northeast-2"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}

provider "aws" {
  region = "ap-northeast-2"
}

data "terraform_remote_state" "storage" {
  backend = "s3"
  config = {
    bucket = "codedang-tf-state"
    key    = "terraform/storage.tfstate"
    region = "ap-northeast-2"
  }
}

data "terraform_remote_state" "codedang" {
  backend = "s3"
  config = {
    bucket = "codedang-tf-state"
    key    = "terraform/codedang.tfstate"
    region = "ap-northeast-2"
  }
}

locals {
  storage  = data.terraform_remote_state.storage.outputs
  codedang = data.terraform_remote_state.codedang.outputs
}
