# Purpose: Onboarding for fresh team members

resource "aws_route53_record" "junyoung-terrform-practice" {
  name    = "junyoung.stage.codedang.com"
  zone_id = data.aws_route53_zone.codedang.zone_id
  type    = "A"
  records = local.stage_cluster_ip
  ttl     = 300
 }
