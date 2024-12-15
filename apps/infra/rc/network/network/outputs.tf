output "vpc_id" {
  value = aws_vpc.main.id
  sensitive = true
}

output "private_route_table_id" {
  value = aws_route_table.private.id
  sensitive = true
}

output "public_ip" {
  value = aws_eip.nat_instance.public_ip
  sensitive = true
}

output "mq_subnet_id" {
  value = aws_subnet.private_mq.id
  sensitive = true
}

output "subnet_ids" {
  value = merge(
    #Private
    module.private_api_subnets.subnet_ids,
    module.private_iris_subnets.subnet_ids,
    module.private_admin_api_subnets.subnet_ids,
    module.private_redis_subnets.subnet_ids,
    module.private_db_subnets.subnet_ids,
    #Public
    module.public_api_subnets.subnet_ids
  )
}

output "security_group_ids" {
  value = merge(
    module.storage_security_groups.security_group_ids,
    module.lb_security_groups.security_group_ids,
    module.ssh_security_groups.security_group_ids,
    module.app_security_groups.security_group_ids,
    module.nat_security_groups.security_group_ids
  )
}

output "route53_zone_id" {
  value = length(aws_route53_zone.codedang) > 0 ? aws_route53_zone.codedang[0].zone_id : null
}

output "route53_certificate_arn" {
  value = length(aws_acm_certificate_validation.for_all_domains) > 0 ? aws_acm_certificate_validation.for_all_domains[0].certificate_arn : null
}