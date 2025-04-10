# AWS provider for US East 1 (required for ACM)
provider "aws" {
  region = "ap-northeast-2"
}

# Data source to reference the existing ACM certificate
data "aws_acm_certificate" "codedang" {
  provider = aws.us_east_1
  domain   = "rc.codedang.com"
  statuses = ["ISSUED", "PENDING_VALIDATION"]
}

# Certificate validation
resource "aws_acm_certificate_validation" "for_all_domains" {
  count           = var.env == "rc" ? 1 : 0
  provider        = aws.us_east_1
  certificate_arn = data.aws_acm_certificate.codedang.arn
  validation_record_fqdns = [
    for dvo in data.aws_acm_certificate.codedang.domain_validation_options : dvo.resource_record_name
  ]
}
