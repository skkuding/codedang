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

# Not SENTRY_AUTH_TOKEN: the Sentry CLI and the Next.js build plugin read that
# name too, and this token is only for Terraform (see .envrc.local.example).
variable "sentry_token" {
  type      = string
  sensitive = true
}

provider "sentry" {
  token = var.sentry_token
}

data "sentry_organization" "skkuding" {
  slug = "skkuding"
}
