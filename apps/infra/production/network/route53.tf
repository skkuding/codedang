provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

resource "aws_route53_zone" "codedang" {
  name = "codedang.com"
}

resource "aws_route53_record" "codedang" {
  name    = "codedang.com"
  type    = "A"
  zone_id = aws_route53_zone.codedang.zone_id

  alias {
    name                   = aws_cloudfront_distribution.codedang.domain_name
    zone_id                = aws_cloudfront_distribution.codedang.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_acm_certificate" "codedang" {
  domain_name       = "codedang.com"
  validation_method = "DNS"
  provider          = aws.us_east_1
}

resource "aws_route53_record" "certificate" {
  for_each = {
    for dvo in aws_acm_certificate.codedang.domain_validation_options : dvo.domain_name => {
      name    = dvo.resource_record_name
      zone_id = aws_route53_zone.codedang.zone_id
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

resource "aws_acm_certificate_validation" "for_all_domains" {
  provider        = aws.us_east_1
  certificate_arn = aws_acm_certificate.codedang.arn
  validation_record_fqdns = [
    for record in aws_route53_record.certificate : record.fqdn
  ]
}
