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
  value = aws_subnet.public_mq.id
}

output "db_subnet_ids" {
  value = [
    aws_subnet.public_db1.id,
    aws_subnet.public_db2.id,
    aws_subnet.public_db3.id,
  ]
}
