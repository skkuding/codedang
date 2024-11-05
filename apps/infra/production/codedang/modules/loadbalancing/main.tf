terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.74"
    }
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
