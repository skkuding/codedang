# Only the retired stage CloudFront distribution uses this wildcard certificate.
resource "aws_acm_certificate" "stage" {
  provider          = aws.us_east_1
  domain_name       = "*.codedang.com"
  validation_method = "DNS"

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}

# This issued apex certificate has no live consumer and is staged for removal.
resource "aws_acm_certificate" "apex" {
  provider          = aws.us_east_1
  domain_name       = "codedang.com"
  validation_method = "DNS"

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}

# DNS moved on-prem and this distribution has no traffic, so it is retired.
resource "aws_cloudfront_distribution" "stage" {
  aliases         = ["stage.codedang.com"]
  comment         = "Stage Test"
  enabled         = true
  is_ipv6_enabled = true

  origin {
    domain_name = "codedang.vercel.app"
    origin_id   = "frontend"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]
    cache_policy_id        = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
    target_origin_id       = "frontend"
    viewer_protocol_policy = "redirect-to-https"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.stage.arn
    minimum_protocol_version = "TLSv1.2_2021"
    ssl_support_method       = "sni-only"
  }

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}
