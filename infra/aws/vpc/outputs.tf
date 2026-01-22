output "vpc_id" {
  value = aws_vpc.main.id
}

output "public_route_table_id" {
  value = aws_route_table.public.id
}

output "private_route_table_id" {
  value = aws_route_table.private.id
}

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
