# Purpose: Iris pprof profiling endpoint

resource "aws_route53_record" "pprof" {
  name    = "pprof.codedang.com"
  zone_id = data.aws_route53_zone.codedang.zone_id
  type    = "A"
  records = local.prod_cluster_ip
  ttl     = 300
}

resource "aws_route53_record" "pprof_stage" {
  name    = "pprof.stage.codedang.com"
  zone_id = data.aws_route53_zone.codedang.zone_id
  type    = "A"
  records = local.stage_cluster_ip
  ttl     = 300
}
