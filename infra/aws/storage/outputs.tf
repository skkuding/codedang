output "testcase_bucket" {
  value     = aws_s3_bucket.testcase
  sensitive = true
}

output "media_cdn_url" {
  value = "https://${local.media_cdn_domain}"
}

output "media_cdn_distribution_id" {
  value = aws_cloudfront_distribution.media.id
}

output "media_cdn_domain_name" {
  value = aws_cloudfront_distribution.media.domain_name
}

output "media_cdn_hosted_zone_id" {
  value = aws_cloudfront_distribution.media.hosted_zone_id
}

output "database_url" {
  value     = local.database_url
  sensitive = true
}

output "database_secret_arn" {
  value     = aws_secretsmanager_secret.database.arn
  sensitive = true
}
