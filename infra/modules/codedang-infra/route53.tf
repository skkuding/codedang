provider "aws" {
  alias  = "us-east-1"
  region = "us-east-1"
}

resource "aws_route53_zone" "main" {
  name = "codedang.com"
}

resource "aws_acm_certificate" "main" {
  domain_name       = "codedang.com"
  validation_method = "EMAIL"
  provider          = aws.us-east-1
}

resource "aws_route53_record" "main" {
  name    = "codedang.com"
  type    = "A"
  zone_id = aws_route53_zone.main.zone_id

  alias {
    name                   = aws_cloudfront_distribution.main.domain_name
    zone_id                = aws_cloudfront_distribution.main.hosted_zone_id
    evaluate_target_health = false
  }
}
