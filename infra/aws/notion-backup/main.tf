terraform {
  required_version = ">= 1.10.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.100"
    }
  }

  backend "s3" {
    bucket              = "codedang-tf-state"
    key                 = "terraform/notion-backup.tfstate"
    region              = "ap-northeast-2"
    encrypt             = true
    use_lockfile        = true
    allowed_account_ids = ["219857217698"]
  }
}

provider "aws" {
  region              = "ap-northeast-2"
  allowed_account_ids = ["219857217698"]

  default_tags {
    tags = {
      ManagedBy = "Terraform"
      Service   = "notion-backup"
    }
  }
}

data "aws_caller_identity" "current" {}

locals {
  account_id          = "219857217698"
  region              = "ap-northeast-2"
  bucket_name         = "codedang-docs-backup"
  object_prefix       = "production/notion"
  bootstrap_user_name = "tasoo-skkuding-claude"
}

check "target_account" {
  assert {
    condition     = data.aws_caller_identity.current.account_id == local.account_id
    error_message = "Refusing to manage the Notion backup outside AWS account ${local.account_id}."
  }
}
