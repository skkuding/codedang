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
    domain_name = var.env == "production" ? "amplify.codedang.com" : "main.d11kq2upsmcpi9.amplifyapp.com"
    origin_id   = "frontend" # TODO: Add unique ID of Amplify

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  origin {
    #domain_name = data.aws_lb.client_api.dns_name
    #origin_id   = data.aws_lb.client_api.id
    domain_name = module.client_api_loadbalancer.aws_lb_dns_name
    origin_id   = module.client_api_loadbalancer.aws_lb_id

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only" # TODO: allow HTTPS only
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  origin {
    #domain_name = data.aws_lb.admin_api.dns_name
    #origin_id   = data.aws_lb.admin_api.id
    domain_name = module.admin_api_loadbalancer.aws_lb_dns_name
    origin_id   = module.admin_api_loadbalancer.aws_lb_id

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  enabled      = true
  comment      = "Codedang-RC"
  http_version = "http2and3"

  aliases = var.env == "rc" ? [] : ["codedang.com"]

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
    target_origin_id         = module.client_api_loadbalancer.aws_lb_id
    viewer_protocol_policy   = "redirect-to-https"
    cache_policy_id          = data.aws_cloudfront_cache_policy.disable.id
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.allow_all.id
  }

  ordered_cache_behavior {
    path_pattern             = "/graphql"
    allowed_methods          = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods           = ["GET", "HEAD", "OPTIONS"]
    target_origin_id         = module.admin_api_loadbalancer.aws_lb_id
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
    cloudfront_default_certificate = var.env == "rc" ? true : false
    acm_certificate_arn            = var.env != "rc" ? local.network.route53_certificate_arn : null
    ssl_support_method             = var.env != "rc" ? "sni-only" : null
    minimum_protocol_version       = var.env != "rc" ? "TLSv1.2_2021" : null
  }
}

resource "aws_route53_record" "codedang" {
  count   = var.env == "production" ? 1 : 0
  name    = "codedang.com"
  type    = "A"
  zone_id = var.env == "rc" ? "" : local.network.route53_zone_id

  alias {
    name                   = var.env == "rc" ? "" : aws_cloudfront_distribution.codedang.domain_name
    zone_id                = var.env == "rc" ? "" : aws_cloudfront_distribution.codedang.hosted_zone_id
    evaluate_target_health = false
  }
}
