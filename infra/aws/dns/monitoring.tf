resource "aws_route53_record" "grafana" {
  name    = "grafana.codedang.com"
  zone_id = data.aws_route53_zone.codedang.zone_id
  type    = "A"
  records = local.prod_cluster_ip
  ttl     = 300
}

resource "aws_route53_record" "prometheus" {
  name    = "prometheus.codedang.com"
  zone_id = data.aws_route53_zone.codedang.zone_id
  type    = "A"
  records = local.prod_cluster_ip
  ttl     = 300
}

resource "aws_route53_record" "otel_collector" {
  name    = "otel.codedang.com" 
  zone_id = data.aws_route53_zone.codedang.zone_id
  type    = "A"
  records = local.prod_cluster_ip 
  ttl     = 300
}