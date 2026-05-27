terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.100"
    }
  }

  backend "s3" {
    bucket         = "codedang-tf-state"
    key            = "terraform/dns.tfstate"
    region         = "ap-northeast-2"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}

provider "aws" {
  region = "ap-northeast-2"
}

data "aws_route53_zone" "codedang" {
  name = "codedang.com"
}

locals {
  stage_cluster_ip = [
    "115.145.160.238",
    "115.145.160.239",
    "115.145.160.240"
  ]
  prod_cluster_ip = [
    "115.145.172.194",
    "115.145.172.195",
    "115.145.172.196",
    "115.145.172.197",
    "115.145.172.198",
  ]
}
