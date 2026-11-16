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

# The organization is looked up, never managed: a resource here could delete
# the whole organization, including its sponsored plan.
data "sentry_organization" "skkuding" {
  slug = "skkuding"
}
