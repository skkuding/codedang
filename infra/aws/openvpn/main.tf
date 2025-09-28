terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.100"
    }
  }

  backend "s3" {
    bucket       = "codedang-tf-state"
    key          = "terraform/openvpn.tfstate"
    region       = "ap-northeast-2"
    encrypt      = true
    use_lockfile = true
  }
}

provider "aws" {
  region = "ap-northeast-2"
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
