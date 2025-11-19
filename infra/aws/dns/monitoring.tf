resource "aws_route53_record" "grafana" {
  name    = "grafana.codedang.com"
  zone_id = data.aws_route53_zone.codedang.zone_id
  type    = "A"
  records = local.prod_cluster_ip
  ttl     = 300
}

resource "aws_route53_record" "grafana_stage" {
  name    = "grafana.stage.codedang.com"
  zone_id = data.aws_route53_zone.codedang.zone_id
  type    = "A"
  records = local.stage_cluster_ip
  ttl     = 300
}

resource "aws_route53_record" "prometheus" {
  name    = "prometheus.codedang.com"
  zone_id = data.aws_route53_zone.codedang.zone_id
  type    = "A"
  records = local.prod_cluster_ip
  ttl     = 300
}

resource "aws_route53_record" "prometheus_stage" {
  name    = "prometheus.stage.codedang.com"
  zone_id = data.aws_route53_zone.codedang.zone_id
  type    = "A"
  records = local.stage_cluster_ip
  ttl     = 300
}
