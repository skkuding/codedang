# Purpose: Codedang service

resource "aws_route53_record" "codedang" {
  name    = "codedang.com"
  zone_id = data.aws_route53_zone.codedang.zone_id
  type    = "A"
  records = local.prod_cluster_ip
  ttl     = 300
}

# HTTPS RR (RFC 9460): browsers that support it upgrade http:// to https://
# before connecting, so they never need TCP 80 (blocked on some campus networks).
# ServiceMode priority 1 with TargetName "." means this host; complements HSTS.
resource "aws_route53_record" "codedang_https" {
  name    = "codedang.com"
  zone_id = data.aws_route53_zone.codedang.zone_id
  type    = "HTTPS"
  ttl     = 300
  records = ["1 . alpn=\"h2,http/1.1\""]
}

resource "aws_route53_record" "codedang_stage" {
  name    = "stage.codedang.com"
  zone_id = data.aws_route53_zone.codedang.zone_id
  type    = "A"
  records = local.stage_cluster_ip
  ttl     = 300
}

resource "aws_route53_record" "codedang_stage_https" {
  name    = "stage.codedang.com"
  zone_id = data.aws_route53_zone.codedang.zone_id
  type    = "HTTPS"
  ttl     = 300
  records = ["1 . alpn=\"h2,http/1.1\""]
}
