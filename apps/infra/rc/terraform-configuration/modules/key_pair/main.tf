terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.95"
    }
  }

}

provider "aws" {
  region = "ap-northeast-2"
}