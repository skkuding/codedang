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
