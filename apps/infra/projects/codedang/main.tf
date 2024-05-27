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
    region         = var.region
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}

provider "aws" {
  region = var.region
}
