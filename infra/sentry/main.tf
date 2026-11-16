terraform {
  required_version = ">= 1.7.0"

  required_providers {
    sentry = {
      source  = "jianyuan/sentry"
      version = "~> 0.16"
    }
  }

  backend "s3" {
    bucket         = "codedang-tf-state"
    key            = "terraform/sentry.tfstate"
    region         = "ap-northeast-2"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}

# Reads the token from SENTRY_AUTH_TOKEN (see .envrc.local.example).
provider "sentry" {}

data "sentry_organization" "skkuding" {
  slug = "skkuding"
}
