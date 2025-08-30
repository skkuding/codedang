# Purpose: Kubernetes dashboard UI

resource "aws_route53_record" "k8s_dashboard" {
  name    = "k8s.codedang.com"
  zone_id = data.aws_route53_zone.codedang.zone_id
  type    = "A"
  records = local.prod_cluster_ip
  ttl     = 300
}

resource "aws_route53_record" "k8s_dashboard_stage" {
  name    = "k8s.stage.codedang.com"
  zone_id = data.aws_route53_zone.codedang.zone_id
  type    = "A"
  records = local.stage_cluster_ip
  ttl     = 300
}
