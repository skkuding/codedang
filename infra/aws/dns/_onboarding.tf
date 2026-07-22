# Purpose: Onboarding for fresh team members
# Example
# resource "aws_route53_record" "example_first_task" {
#   name    = "example.first-task.codedang.com"
#   zone_id = data.aws_route53_zone.codedang.zone_id
#   type    = "A"
#   records = local.stage_cluster_ip
#   ttl     = 300
# }

resource "aws_route53_record" "taehun-terraform-practice" {
    name = "taehun.stage.codedang.com"
    zone_id = data.aws_route53_zone.codedang.zone_id
    type = "A"
    records = local.stage_cluster_ip
    ttl = 60
}

resource "aws_route53_record" "choesuna-react-app" {
  name    = "choesuna-react-app.stage.codedang.com"
  zone_id = data.aws_route53_zone.codedang.zone_id
  type    = "A"
  records = local.stage_cluster_ip
  ttl     = 300
}

resource "aws_route53_record" "kjk-test-app" {
  name    = "kjktest.stage.codedang.com"
  zone_id = data.aws_route53_zone.codedang.zone_id
  type    = "A"
  records = local.stage_cluster_ip
  ttl     = 300
 }
  
resource "aws_route53_record" "junyoung-terrform-practice" {
  name    = "junyoung.stage.codedang.com"
  zone_id = data.aws_route53_zone.codedang.zone_id
  type = "A"
  records = local.stage_cluster_ip
  ttl = 300
}
