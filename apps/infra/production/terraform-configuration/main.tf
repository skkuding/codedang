terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.52"
    }
  }
}

provider "aws" {
  region = var.region
}
