provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

resource "aws_route53_zone" "codedang" {

  count = var.env == "rc" ? 1 : 0
  name  = "rc.codedang.com"
}


