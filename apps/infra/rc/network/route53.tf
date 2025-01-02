provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

resource "aws_route53_zone" "codedang" {
  count = var.env == "production" ? 1 : 0
  name  = "codedang.com"
}

resource "aws_acm_certificate" "codedang" {
  count             = var.env == "production" ? 1 : 0
  domain_name       = "codedang.com"
  validation_method = "DNS"
  provider          = aws.us_east_1
}

resource "aws_route53_record" "certificate" {
  for_each = var.env == "production" ? {
    for dvo in aws_acm_certificate.codedang[0].domain_validation_options : dvo.domain_name => {
      name    = dvo.resource_record_name
      zone_id = aws_route53_zone.codedang[0].zone_id
      type    = dvo.resource_record_type
      value   = dvo.resource_record_value
    }
  } : {}

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.value]
  ttl             = 60
  type            = each.value.type
  zone_id         = each.value.zone_id
}

resource "aws_acm_certificate_validation" "for_all_domains" {
  count           = var.env == "production" ? 1 : 0
  provider        = aws.us_east_1
  certificate_arn = aws_acm_certificate.codedang[0].arn
  validation_record_fqdns = [
    for record in aws_route53_record.certificate : record.fqdn
  ]
}
