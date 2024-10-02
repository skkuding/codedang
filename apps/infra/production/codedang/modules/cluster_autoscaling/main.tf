terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.69"
    }
  }

}

provider "aws" {
  region = "ap-northeast-2"
}
