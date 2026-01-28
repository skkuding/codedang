output "vpc_id" {
  description = "The ID of the VPC"
  value       = aws_vpc.main.id
}

output "public_route_table_id" {
  description = "The ID of the public route table"
  value       = aws_route_table.public.id
}

output "private_route_table_id" {
  description = "The ID of the private route table"
  value       = aws_route_table.private.id
}

# TODO: ECS Failover System
# output "public_ip" {
#   value     = aws_eip.nat_instance.public_ip
#   sensitive = true
# }

output "mq_subnet_id" {
  value = module.public_api_subnets.subnet_ids["public_mq"]
}

output "db_subnet_ids" {
  value = [
    module.public_api_subnets.subnet_ids["public_db1"],
    module.public_api_subnets.subnet_ids["public_db2"],
    module.public_api_subnets.subnet_ids["public_db3"],
  ]
}

output "subnet_ids" {
  description = "Map of all subnet IDs (Public & Private)"
  value = merge(
    #Private
    module.private_api_subnets.subnet_ids,
    module.private_iris_subnets.subnet_ids,
    module.private_admin_api_subnets.subnet_ids,

    #Public
    module.public_api_subnets.subnet_ids
  )
}

output "security_group_ids" {
  description = "Map of all security group IDs"
  value = merge(
    module.storage_security_groups.security_group_ids,
    module.lb_security_groups.security_group_ids,
    module.ssh_security_groups.security_group_ids,
    module.app_security_groups.security_group_ids,
    module.nat_security_groups.security_group_ids
  )
}
