data "aws_lb" "client_api" {
  name = "Codedang-Client-Api-LB"
}

data "aws_lb" "admin_api" {
  name = "Codedang-Admin-Api-LB"
}

data "aws_cloudfront_cache_policy" "disable" {
  name = "Managed-CachingDisabled"
}

data "aws_cloudfront_origin_request_policy" "allow_all" {
  name = "Managed-AllViewer"
}

data "aws_cloudfront_origin_request_policy" "exclude_host_header" {
  name = "Managed-AllViewerExceptHostHeader"
}

resource "aws_cloudfront_distribution" "codedang" {
  origin {
    domain_name = "amplify.codedang.com"
    origin_id   = "frontend" # TODO: Add unique ID of Amplify

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  origin {
    domain_name = data.aws_lb.client_api.dns_name
    origin_id   = data.aws_lb.client_api.id

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only" # TODO: allow HTTPS only
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  origin {
    domain_name = data.aws_lb.admin_api.dns_name
    origin_id   = data.aws_lb.admin_api.id

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  enabled      = true
  comment      = "Codedang"
  http_version = "http2and3"

  aliases = ["codedang.com"]

  default_cache_behavior {
    allowed_methods          = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods           = ["GET", "HEAD", "OPTIONS"]
    target_origin_id         = "frontend" # TODO: do not hard-code origin_id
    viewer_protocol_policy   = "redirect-to-https"
    cache_policy_id          = data.aws_cloudfront_cache_policy.disable.id
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.exclude_host_header.id
  }

  ordered_cache_behavior {
    path_pattern             = "/api/*"
    allowed_methods          = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods           = ["GET", "HEAD", "OPTIONS"]
    target_origin_id         = data.aws_lb.client_api.id
    viewer_protocol_policy   = "redirect-to-https"
    cache_policy_id          = data.aws_cloudfront_cache_policy.disable.id
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.allow_all.id
  }

  ordered_cache_behavior {
    path_pattern             = "/graphql"
    allowed_methods          = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods           = ["GET", "HEAD", "OPTIONS"]
    target_origin_id         = data.aws_lb.admin_api.id
    viewer_protocol_policy   = "redirect-to-https"
    cache_policy_id          = data.aws_cloudfront_cache_policy.disable.id
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.allow_all.id
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.for_all_domains.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}
