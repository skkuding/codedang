resource "aws_route53_record" "n8n" {
  name    = "n8n.codedang.com"
  zone_id = data.aws_route53_zone.codedang.zone_id
  type    = "A"
  records = local.prod_cluster_ip
  ttl     = 300
}
