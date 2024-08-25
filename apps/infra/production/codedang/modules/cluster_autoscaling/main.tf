terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.63"
    }
  }

}

provider "aws" {
  region = "ap-northeast-2"
}
