############## RDS ##############
resource "aws_subnet" "isolated_subnets" {
  vpc_id     = aws_vpc.main.id
  for_each   = var.isolated_subnets
  cidr_block = cidrsubnet(aws_vpc.main.cidr_block, 8, each.value)
  # 10.0.3.0/24 10.0.4.0/24 로 매핑
  availability_zone = each.key # ap-northeast-2a, apnortheast-2c에 매핑

  tags = {
    Name = "codedang-isolated-subnet-${each.value == 3 ? "1" : "2"}" # isolated_subnet 변수의 key-value에서 value값 돌면서 naming
    Tier = "Isolated"
  }
}

/*
Data source 는 Terraform 을 사용하지 않고 만든 infrastructure resource 또는 다른 곳에서 사용중인 Terraform code 를 통해 만들어진 resource 의 Data 를 가져오는데 사용된다.
각각의 provider 들은 resource 와 함께 data source 도 제공하고 있다.
*/
# data "aws_subnet" "isolated_subnets" { # data block으로 우리가 만든 aws resource들을 불러온다.
#   vpc_id = aws_vpc.main.id

#   filter {
#     name   = "tags:Name"
#     values = ["isolated"]
#     /* https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/subnet 참고
#     Set of values that are accepted for the given field. A subnet will be selected if any one of the given values matches.*/
#   }

#   filter {
#     name   = "tags:Tier"
#     values = ["Isolated"]
#   }
# }

resource "aws_security_group" "rds_ingress" {
  name        = var.rds_ingress_name
  description = "Ingress traffic from Private subnets"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = var.rds_ingress_ports
    to_port     = var.rds_ingress_ports
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.main.cidr_block]
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }
}

resource "aws_db_subnet_group" "rds_subnet_group" {
  for_each   = var.isolated_subnets
  name       = "codedang-db-subnet-gruop"
  subnet_ids = [aws_subnet.isolated_subnets[each.key].id, aws_subnet.isolated_subnets[each.key].id]
  tags = {
    Name = "codedang-db-subnet-${each.value}"
  }
}


resource "aws_db_instance" "codedang" {
  for_each = var.isolated_subnets

  identifier                 = "codedang"
  instance_class             = "db.t3.micro"
  allocated_storage          = 20
  engine                     = "postgres"
  engine_version             = "14.7"
  username                   = var.user_name
  password                   = var.rds_password
  db_subnet_group_name       = aws_db_subnet_group.rds_subnet_group[each.key].name
  skip_final_snapshot        = true
  storage_encrypted          = false
  publicly_accessible        = true
  apply_immediately          = true
  backup_window              = var.backup_windows_retention_maintenance[0]
  backup_retention_period    = var.backup_windows_retention_maintenance[1]
  maintenance_window         = var.backup_windows_retention_maintenance[2]
  vpc_security_group_ids     = [aws_security_group.rds_ingress.id]
  availability_zone          = "ap-northeast-2a"
  auto_minor_version_upgrade = false
}
