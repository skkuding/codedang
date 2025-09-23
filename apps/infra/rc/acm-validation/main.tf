# AWS provider for US East 1 (required for ACM)

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.100"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.7"
    }
  }

  backend "s3" {
    bucket         = "codedang-tf-state-rc"
    key            = "terraform/acm-validation.tfstate"
    region         = "ap-northeast-2"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

data "aws_route53_zone" "main" {
  name = "rc.codedang.com"
}

resource "aws_acm_certificate" "codedang" {
  count       = var.env == "rc" ? 1 : 0
  domain_name = "rc.codedang.com"

  validation_method = "DNS"
  provider          = aws.us_east_1
}

resource "aws_route53_record" "certificate" {

  for_each = {
    for dvo in aws_acm_certificate.codedang[0].domain_validation_options : dvo.domain_name => {
      name    = dvo.resource_record_name
      zone_id = data.aws_route53_zone.main.zone_id
      type    = dvo.resource_record_type
      value   = dvo.resource_record_value
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.value]
  ttl             = 60
  type            = each.value.type
  zone_id         = each.value.zone_id
}

# Certificate validation
resource "aws_acm_certificate_validation" "for_all_domains" {
  count           = var.env == "rc" ? 1 : 0
  provider        = aws.us_east_1
  certificate_arn = aws_acm_certificate.codedang[0].arn
  validation_record_fqdns = [
    for record in aws_route53_record.certificate : record.fqdn
  ]
}
