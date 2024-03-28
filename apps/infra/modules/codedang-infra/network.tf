################# VPC #################
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"

  tags = {
    Name = "Codedang-VPC"
  }
}

################# Public Subnet #################
# NAT Gateway 생성
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "Codedang-InternetFacing"
  }
}

resource "aws_eip" "nat_eip" {
  domain = "vpc"

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [aws_internet_gateway.main]
}

resource "aws_subnet" "public_subnet1" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.90.0/24"
  availability_zone = var.availability_zones[0]

  tags = {
    Name = "Codedang-Public-Nat-Subnet1"
  }
}

resource "aws_subnet" "public_subnet2" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.91.0/24"
  availability_zone = var.availability_zones[2]

  tags = {
    Name = "Codedang-Public-Nat-Subnet2"
  }
}

resource "aws_nat_gateway" "nat" {
  allocation_id = aws_eip.nat_eip.id
  subnet_id     = aws_subnet.public_subnet1.id # NAT는 기본적으로 public subnet에 존재
  # public_subnet2에도 할당 필요(나중에 vpc endpoint 수정)

  tags = {
    Name = "Codedang-NatGateway-1"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  route {
    ipv6_cidr_block = "::/0"
    gateway_id      = aws_internet_gateway.main.id
  }

  tags = {
    Name = "Codedang-Public-RT"
  }
}

resource "aws_route_table_association" "public_subnet1" {
  subnet_id      = aws_subnet.public_subnet1.id
  route_table_id = aws_route_table.public.id
}
resource "aws_route_table_association" "public_subnet2" {
  subnet_id      = aws_subnet.public_subnet2.id
  route_table_id = aws_route_table.public.id
}

################# Private Subnet #################
resource "aws_route_table" "private-ecs" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat.id
  }

  # route {
  #   ipv6_cidr_block = "::/0"
  #   gateway_id      = aws_nat_gateway.nat.id
  # }

  tags = {
    Name = "Codedang-Private-RT"
  }
}

# resource "aws_main_route_table_association" "main" {
#   vpc_id         = aws_vpc.main.id
#   route_table_id = aws_route_table.private.id
# }

resource "aws_route_table_association" "admin_api1" {
  subnet_id      = aws_subnet.private_admin_api1.id
  route_table_id = aws_route_table.private-ecs.id
}
resource "aws_route_table_association" "admin_api2" {
  subnet_id      = aws_subnet.private_admin_api2.id
  route_table_id = aws_route_table.private-ecs.id
}

resource "aws_route_table_association" "iris1" {
  subnet_id      = aws_subnet.private_iris1.id
  route_table_id = aws_route_table.private-ecs.id
}
resource "aws_route_table_association" "iris2" {
  subnet_id      = aws_subnet.private_iris2.id
  route_table_id = aws_route_table.private-ecs.id
}

resource "aws_route_table_association" "client_api1" {
  subnet_id      = aws_subnet.private_client_api1.id
  route_table_id = aws_route_table.private-ecs.id
}
resource "aws_route_table_association" "client_api2" {
  subnet_id      = aws_subnet.private_client_api2.id
  route_table_id = aws_route_table.private-ecs.id
}
