# Purpose: Codedang service

resource "aws_route53_record" "codedang" {
  name    = "codedang.com"
  zone_id = data.aws_route53_zone.codedang.zone_id
  type    = "A"
  records = local.prod_cluster_ip
  ttl     = 300
}

resource "aws_route53_record" "codedang_stage" {
  name    = "stage.codedang.com"
  zone_id = data.aws_route53_zone.codedang.zone_id
  type    = "A"
  records = local.stage_cluster_ip
  ttl     = 300
}
