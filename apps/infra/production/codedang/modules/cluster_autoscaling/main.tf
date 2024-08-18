terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.62"
    }
  }

}

provider "aws" {
  region = "ap-northeast-2"
}
