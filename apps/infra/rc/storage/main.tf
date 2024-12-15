terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.75"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  backend "s3" {
    bucket         = "codedang-tf-state"
    key            = "terraform/storage.tfstate"
    region         = "ap-northeast-2"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
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

locals {
  network = data.terraform_remote_state.network.outputs
}
