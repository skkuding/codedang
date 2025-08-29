# Purpose: RabbitMQ management UI

resource "aws_route53_record" "rabbitmq" {
  name    = "rabbitmq.codedang.com"
  zone_id = data.aws_route53_zone.codedang.zone_id
  type    = "A"
  records = local.prod_cluster_ip
}

resource "aws_route53_record" "rabbitmq_stage" {
  name    = "rabbitmq.stage.codedang.com"
  zone_id = data.aws_route53_zone.codedang.zone_id
  type    = "A"
  records = local.stage_cluster_ip
}
