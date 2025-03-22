terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.92"
    }
  }

}

provider "aws" {
  region = "ap-northeast-2"
}