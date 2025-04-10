output "route53_certificate_arn" {
  value = length(aws_acm_certificate_validation.for_all_domains) > 0 ? aws_acm_certificate_validation.for_all_domains[0].certificate_arn : null
}
