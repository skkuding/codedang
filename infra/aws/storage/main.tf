terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.100"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.8"
    }
  }

  backend "s3" {
    bucket         = "codedang-tf-state"
    key            = "terraform/db.tfstate"
    region         = "ap-northeast-2"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}

provider "aws" {
  region = "ap-northeast-2"
}

data "aws_vpc" "main" {
  tags = {
    Name = "Codedang-VPC"
  }
}

data "terraform_remote_state" "vpc" {
  backend = "s3"
  config = {
    bucket = "codedang-tf-state"
    key    = "terraform/vpc.tfstate"
    region = "ap-northeast-2"
  }
}

locals {
  vpc = data.terraform_remote_state.vpc.outputs
}
