resource "aws_route53_record" "grafana" {
  name    = "grafana.codedang.com"
  zone_id = data.aws_route53_zone.codedang.zone_id
  type    = "A"
  records = ["115.145.160.239"] # server2
  ttl     = 300
}

resource "aws_route53_record" "otel" {
  name    = "otel.codedang.com"
  zone_id = data.aws_route53_zone.codedang.zone_id
  type    = "A"
  records = ["115.145.160.239"] # server2
  ttl     = 300
}
