terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.65"
    }
  }

}

provider "aws" {
  region = "ap-northeast-2"
}
