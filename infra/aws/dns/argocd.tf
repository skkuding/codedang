# Purpose: ArgoCD UI

resource "aws_route53_record" "argocd" {
  name    = "argocd.codedang.com"
  zone_id = data.aws_route53_zone.codedang.zone_id
  type    = "A"
  records = local.prod_cluster_ip
  ttl     = 300
}
