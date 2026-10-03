# Purpose: Frigate UI for the stage USB home camera

resource "aws_route53_record" "frigate_stage" {
  name    = "frigate.stage.codedang.com"
  zone_id = data.aws_route53_zone.codedang.zone_id
  type    = "A"
  records = local.stage_cluster_ip
  ttl     = 300
}
