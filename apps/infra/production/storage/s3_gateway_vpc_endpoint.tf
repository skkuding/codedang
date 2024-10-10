data "aws_route_table" "private" {
  vpc_id = data.aws_vpc.main.id
  tags = {
    Name = "Codedang-Private-RT"
  }
}

resource "aws_vpc_endpoint" "s3_endpoint" {
  vpc_id            = data.aws_vpc.main.id
  service_name      = "com.amazonaws.${var.region}.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = [data.aws_route_table.private.id]

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

