# Purpose: Codedang runner (previously iris-runner) service

# resource "aws_route53_record" "runner" {
#   name    = "run.codedang.com"
#   zone_id = data.aws_route53_zone.codedang.zone_id
#   type    = "A"
#   records = local.prod_cluster_ip
#   ttl     = 300
# }

# TODO: Add to terraform when stage runner service migration is complete
# resource "aws_route53_record" "runner_stage" {
#   name    = "run.stage.codedang.com"
#   zone_id = data.aws_route53_zone.codedang.zone_id
#   type    = "A"
#   records = local.stage_cluster_ip
#   ttl     = 300
# }
