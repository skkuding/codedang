terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "codedang-tf-state"
    key            = "terraform/terraform.tfstate"
    region         = "ap-northeast-2"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
    profile = "default"
    # 다른 profile 사용 시 -> terraform init -backend-config "profile=계정"
  }
}

module "codedang" {
  source = "../modules/codedang-infra"

  region = var.region
}

module "tf-backend" {
  source = "../modules/codedang-tf-backend"
}
