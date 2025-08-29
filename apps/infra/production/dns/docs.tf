# Purpose: Codedang documentation
# Original source: https://github.com/skkuding/docs

resource "aws_route53_record" "docs" {
  name    = "docs.codedang.com"
  zone_id = data.aws_route53_zone.codedang.zone_id
  type    = "CNAME"
  records = ["skkuding.github.io"]
}
