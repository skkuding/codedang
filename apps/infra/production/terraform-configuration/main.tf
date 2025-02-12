terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.86"
    }
  }
}

provider "aws" {
  region = var.region
}
