resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "Codedang-InternetFacing"
  }
}

resource "aws_eip" "for_nat" {
  domain = "vpc"

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [aws_internet_gateway.main]

  tags = {
    Name = "Codedang-NatEIP"
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

resource "aws_subnet" "public_subnet1" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.90.0/24"
  availability_zone = "ap-northeast-2a"

  tags = {
    Name = "Codedang-Public-Nat-Subnet1"
  }
}

resource "aws_subnet" "public_subnet2" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.91.0/24"
  availability_zone = "ap-northeast-2c"

  tags = {
    Name = "Codedang-Public-Nat-Subnet2"
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
