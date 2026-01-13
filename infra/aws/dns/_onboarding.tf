resource "aws_route53_record" "sumin-onboarding" {
  name    = "week2-restaurants.sumin-onboarding.stage.codedang.com"
  zone_id = data.aws_route53_zone.codedang.zone_id
  type    = "A"
  records = local.stage_cluster_ip
  ttl     = 300
}
