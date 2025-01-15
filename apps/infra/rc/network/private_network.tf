resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block           = "0.0.0.0/0"
    network_interface_id = aws_instance.nat_instance.primary_network_interface_id
  }

  tags = {
    Name = "Codedang-Private-RT"
  }
}

module "private_api_subnets" {
  source = "./modules/subnet"

  subnets = {
    private_api1 = {
      cidr_block        = "10.0.1.0/24"
      vpc_id            = aws_vpc.main.id
      availability_zone = "ap-northeast-2a"
      tags_name         = "Codedang-Api-Subnet1"
      route_table_id    = aws_route_table.private.id
    }
    private_api2 = {
      cidr_block        = "10.0.2.0/24"
      vpc_id            = aws_vpc.main.id
      availability_zone = "ap-northeast-2c"
      tags_name         = "Codedang-Api-Subnet2"
      route_table_id    = aws_route_table.private.id
    }
  }
}

module "private_iris_subnets" {
  source = "./modules/subnet"

  subnets = {
    private_iris1 = {
      cidr_block        = "10.0.41.0/24"
      vpc_id            = aws_vpc.main.id
      availability_zone = "ap-northeast-2a"
      tags_name         = "Codedang-Iris-Subnet1"
      route_table_id    = aws_route_table.private.id
    }
    private_iris2 = {
      cidr_block        = "10.0.42.0/24"
      vpc_id            = aws_vpc.main.id
      availability_zone = "ap-northeast-2c"
      tags_name         = "Codedang-Iris-Subnet2"
      route_table_id    = aws_route_table.private.id
    }
  }
}

module "private_admin_api_subnets" {
  source = "./modules/subnet"

  subnets = {
    private_admin_api1 = {
      cidr_block        = "10.0.3.0/24"
      vpc_id            = aws_vpc.main.id
      availability_zone = "ap-northeast-2a"
      tags_name         = "Codedang-Admin-Api-Subnet1"
      route_table_id    = aws_route_table.private.id
    }
    private_admin_api2 = {
      cidr_block        = "10.0.4.0/24"
      vpc_id            = aws_vpc.main.id
      availability_zone = "ap-northeast-2c"
      tags_name         = "Codedang-Admin-Api-Subnet2"
      route_table_id    = aws_route_table.private.id
    }
  }
}

module "private_redis_subnets" {
  source = "./modules/subnet"

  subnets = {
    private_redis1 = {
      cidr_block        = "10.0.31.0/24"
      vpc_id            = aws_vpc.main.id
      availability_zone = "ap-northeast-2a"
      tags_name         = "Codedang_Redis-Subnet1"
      route_table_id    = aws_route_table.private.id
    }
    private_redis2 = {
      cidr_block        = "10.0.32.0/24"
      vpc_id            = aws_vpc.main.id
      availability_zone = "ap-northeast-2b"
      tags_name         = "Codedang_Redis-Subnet2"
      route_table_id    = aws_route_table.private.id
    }
  }
}

module "private_db_subnets" {
  source = "./modules/subnet"

  subnets = {
    private_db1 = {
      cidr_block        = "10.0.11.0/24"
      vpc_id            = aws_vpc.main.id
      availability_zone = "ap-northeast-2a"
      tags_name         = "Codedang-DB-Subnet1"
      route_table_id    = aws_route_table.private.id
    }
    private_db2 = {
      cidr_block        = "10.0.12.0/24"
      vpc_id            = aws_vpc.main.id
      availability_zone = "ap-northeast-2b"
      tags_name         = "Codedang-DB-Subnet2"
      route_table_id    = aws_route_table.private.id
    }
    private_db3 = {
      cidr_block        = "10.0.13.0/24"
      vpc_id            = aws_vpc.main.id
      availability_zone = "ap-northeast-2c"
      tags_name         = "Codedang-DB-Subnet3"
      route_table_id    = aws_route_table.private.id
    }
  }
}

# 알림: Route Table 연결이 불필요해 모듈로 생성하지 않음.
# 일관성을 위해 Network 프로젝트에 두었으나, 차후 하이브리드 클라우드
# 전환 시 유연하게 대처할 것...
resource "aws_subnet" "private_mq" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.20.0/24"
  availability_zone = "ap-northeast-2a"

  tags = {
    Name = "Codedang-MQ-Subnet1"
  }
}