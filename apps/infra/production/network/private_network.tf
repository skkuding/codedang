resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.public_subnet1.id
  }

  tags = {
    Name = "Codedang-Private-RT"
  }
}

resource "aws_route_table_association" "admin_api1" {
  subnet_id      = var.private_admin_api1_subnet_id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "admin_api2" {
  subnet_id      = var.private_admin_api2_subnet_id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "iris1" {
  subnet_id      = var.private_iris1_subnet_id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "iris2" {
  subnet_id      = var.private_iris2_subnet_id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "client_api1" {
  subnet_id      = var.private_client_api1_subnet_id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "client_api2" {
  subnet_id      = var.private_client_api2_subnet_id
  route_table_id = aws_route_table.private.id
}
