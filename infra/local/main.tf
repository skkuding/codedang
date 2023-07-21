terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

module "codedang" {
  source = "../modules/codedang-infra"

  region = var.region
}
