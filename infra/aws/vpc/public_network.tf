resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "Codedang-InternetFacing"
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

resource "aws_subnet" "public_mq" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.101.0/24"
  availability_zone = "ap-northeast-2a"

  tags = {
    Name = "Codedang-MQ-Subnet"
  }
}

# Temporarily expose database to public for on-premise iris
# TODO: Move database back to private subnet, after migrating testcase from db to s3
resource "aws_subnet" "public_db1" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.102.0/24"
  availability_zone = "ap-northeast-2a"

  tags = {
    Name = "Codedang-DB-PublicSubnet1"
  }
}

resource "aws_subnet" "public_db2" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.103.0/24"
  availability_zone = "ap-northeast-2b"

  tags = {
    Name = "Codedang-DB-PublicSubnet2"
  }
}

resource "aws_subnet" "public_db3" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.104.0/24"
  availability_zone = "ap-northeast-2c"

  tags = {
    Name = "Codedang-DB-PublicSubnet3"
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

resource "aws_route_table_association" "public_mq" {
  subnet_id      = aws_subnet.public_mq.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_db1" {
  subnet_id      = aws_subnet.public_db1.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_db2" {
  subnet_id      = aws_subnet.public_db2.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_db3" {
  subnet_id      = aws_subnet.public_db3.id
  route_table_id = aws_route_table.public.id
}
