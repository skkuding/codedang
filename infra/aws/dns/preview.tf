# Purpose: Argo CD preview deployments

resource "aws_route53_record" "preview" {
  name    = "*.preview.codedang.com"
  zone_id = data.aws_route53_zone.codedang.zone_id
  type    = "A"
  records = local.stage_cluster_ip
  ttl     = 300
}
