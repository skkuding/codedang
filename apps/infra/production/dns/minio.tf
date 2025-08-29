# Purpose: MinIO console UI

resource "aws_route53_record" "minio" {
  name    = "minio.codedang.com"
  zone_id = data.aws_route53_zone.codedang.zone_id
  type    = "A"
  records = local.prod_cluster_ip
}

resource "aws_route53_record" "minio_stage" {
  name    = "minio.stage.codedang.com"
  zone_id = data.aws_route53_zone.codedang.zone_id
  type    = "A"
  records = local.stage_cluster_ip
}
