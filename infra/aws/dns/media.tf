# Purpose: CloudFront distribution in front of the codedang-media bucket
# Original source: infra/aws/storage/cloudfront_media.tf

resource "aws_route53_record" "media" {
  for_each = toset(["A", "AAAA"])

  name    = "media.codedang.com"
  zone_id = data.aws_route53_zone.codedang.zone_id
  type    = each.value

  alias {
    name                   = data.terraform_remote_state.storage.outputs.media_cdn_domain_name
    zone_id                = data.terraform_remote_state.storage.outputs.media_cdn_hosted_zone_id
    evaluate_target_health = false
  }
}
