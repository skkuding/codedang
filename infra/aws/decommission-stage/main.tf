terraform {
  required_version = ">= 1.10.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.100"
    }
  }

  backend "s3" {
    bucket       = "codedang-tf-state"
    key          = "terraform/decommission-stage.tfstate"
    region       = "ap-northeast-2"
    encrypt      = true
    use_lockfile = true
  }
}

provider "aws" {
  region = "ap-northeast-2"
}

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}
