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

output "db_subnet_ids" {
  value = [
    module.public_db_subnets.subnet_ids["public_db1"],
    module.public_db_subnets.subnet_ids["public_db2"],
    module.public_db_subnets.subnet_ids["public_db3"],
  ]
}

output "security_group_ids" {
  description = "Map of active security group IDs"
  value       = module.database_security_groups.security_group_ids
}
