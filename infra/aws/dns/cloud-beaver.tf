# Purpose: CloudBeaver UI for database management

resource "aws_route53_record" "cloud_beaver_stage" {
  name    = "beaver.stage.codedang.com"
  zone_id = data.aws_route53_zone.codedang.zone_id
  type    = "A"
  records = local.stage_cluster_ip
  ttl     = 300
}
