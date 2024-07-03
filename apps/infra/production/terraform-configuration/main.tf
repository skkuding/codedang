terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.56"
    }
  }
}

provider "aws" {
  region = var.region
}
