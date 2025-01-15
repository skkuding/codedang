resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"

  tags = {
    Name = "Codedang-VPC"
  }
}

#resource "aws_network_interface" "codedang_nat_instance" {
#  subnet_id       = module.public_api_subnets.subnet_ids["public_nat"]
#  security_groups = [module.nat_security_groups.security_group_ids["sg_nat_instance"]]
#
#  tags = {
#    Name = "Codedang-eni"
#  }
#}


resource "aws_vpc_endpoint" "s3_endpoint" {
  vpc_id            = aws_vpc.main.id
  service_name      = "com.amazonaws.${var.region}.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = [aws_route_table.private.id]

  policy = jsonencode({
    Version = "2008-10-17"
    Statement = [
      {
        Action    = "*",
        Effect    = "Allow",
        Resource  = "*",
        Principal = "*"
      }
    ]
  })

  tags = {
    "Name" = "S3-Gateway-Endpoint-for-Private-RT"
  }
}