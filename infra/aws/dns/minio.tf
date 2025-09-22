# Purpose: MinIO console UI

resource "aws_route53_record" "minio_stage" {
  name    = "minio.stage.codedang.com"
  zone_id = data.aws_route53_zone.codedang.zone_id
  type    = "A"
  records = local.stage_cluster_ip
  ttl     = 300
}
