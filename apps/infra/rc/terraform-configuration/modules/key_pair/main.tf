terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.100"
    }
  }

}

provider "aws" {
  region = "ap-northeast-2"
}