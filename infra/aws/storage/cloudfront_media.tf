# CloudFront in front of the codedang-media bucket (TAS-3053).
#
# The distribution reads the bucket through Origin Access Control (OAC). The
# bucket's public GetObject policy is intentionally kept in s3_media.tf: object
# URLs of the form https://codedang-media.s3.ap-northeast-2.amazonaws.com/<key>
# are persisted in contest posters and rich-text content, so the bucket can only
# be made private after those URLs are migrated to the CDN hostname.
#
# The media.codedang.com A/AAAA alias records live in infra/aws/dns/media.tf,
# which reads this project's outputs. Only the ACM validation records are kept
# here, because the certificate validation waits on them within the same apply.

locals {
  media_cdn_domain = "media.codedang.com"
}

data "aws_route53_zone" "codedang" {
  name = "codedang.com"
}

data "aws_cloudfront_cache_policy" "caching_optimized" {
  name = "Managed-CachingOptimized"
}

resource "aws_acm_certificate" "media_cdn" {
  provider          = aws.us_east_1
  domain_name       = local.media_cdn_domain
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "Codedang-Media-CDN"
  }
}

resource "aws_route53_record" "media_cdn_validation" {
  for_each = {
    for option in aws_acm_certificate.media_cdn.domain_validation_options :
    option.domain_name => {
      name   = option.resource_record_name
      record = option.resource_record_value
      type   = option.resource_record_type
    }
  }

  zone_id         = data.aws_route53_zone.codedang.zone_id
  name            = each.value.name
  type            = each.value.type
  records         = [each.value.record]
  ttl             = 60
  allow_overwrite = true
}

resource "aws_acm_certificate_validation" "media_cdn" {
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.media_cdn.arn
  validation_record_fqdns = [for record in aws_route53_record.media_cdn_validation : record.fqdn]
}

resource "aws_cloudfront_origin_access_control" "media" {
  name                              = "codedang-media"
  description                       = "OAC for the codedang-media bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "media" {
  comment             = "Codedang media (codedang-media bucket)"
  enabled             = true
  is_ipv6_enabled     = true
  http_version        = "http2and3"
  price_class         = "PriceClass_200" # excludes South America and Oceania edges
  aliases             = [local.media_cdn_domain]
  wait_for_deployment = true

  origin {
    origin_id                = "codedang-media"
    domain_name              = aws_s3_bucket.media.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.media.id
  }

  # Media objects are immutable (random UUID keys), so the managed policy that
  # honors the origin's Cache-Control and forwards no query strings, cookies or
  # headers gives the best hit ratio.
  default_cache_behavior {
    target_origin_id       = "codedang-media"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = data.aws_cloudfront_cache_policy.caching_optimized.id
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.media_cdn.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Name = "Codedang-Media"
  }
}
