# This shared CNAME renews active codedang.com certificates, so it remains in DNS.
resource "aws_route53_record" "acm_validation" {
  name    = "_945ec07f918ee2f223a9950f25773078.codedang.com"
  records = ["_023c61948fa0348f46d6b12b2c98be56.jsxlrrpjwm.acm-validations.aws."]
  ttl     = 60
  type    = "CNAME"
  zone_id = aws_route53_zone.codedang.zone_id

  lifecycle {
    prevent_destroy = true
  }
}

import {
  to = aws_route53_record.acm_validation
  id = "Z02931601ELG5RAXUQ69W__945ec07f918ee2f223a9950f25773078.codedang.com_CNAME"
}
