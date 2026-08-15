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


module "public_api_subnets" {
  source = "./modules/subnet"

  subnets = {
    # Temporarily expose database to public for on-premise iris
    # TODO: Move database back to private subnet, after migrating testcase from db to s3
    # Check private_network.tf "module.private_db_subnets"
    public_db1 = {
      cidr_block        = "10.0.102.0/24"
      vpc_id            = aws_vpc.main.id
      availability_zone = "ap-northeast-2a"
      tags_name         = "Codedang-DB-PublicSubnet1"
      route_table_id    = aws_route_table.public.id
    }
    public_db2 = {
      cidr_block        = "10.0.103.0/24"
      vpc_id            = aws_vpc.main.id
      availability_zone = "ap-northeast-2b"
      tags_name         = "Codedang-DB-PublicSubnet2"
      route_table_id    = aws_route_table.public.id
    }
    public_db3 = {
      cidr_block        = "10.0.104.0/24"
      vpc_id            = aws_vpc.main.id
      availability_zone = "ap-northeast-2c"
      tags_name         = "Codedang-DB-PublicSubnet3"
      route_table_id    = aws_route_table.public.id
    }
  }
}
