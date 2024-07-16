resource "aws_subnet" "private_db1" {
  vpc_id            = data.aws_vpc.main.id
  cidr_block        = "10.0.11.0/24"
  availability_zone = "ap-northeast-2a"

  tags = {
    Name = "Codedang-DB-Subnet1"
  }
}

resource "aws_subnet" "private_db2" {
  vpc_id            = data.aws_vpc.main.id
  cidr_block        = "10.0.12.0/24"
  availability_zone = "ap-northeast-2b"

  tags = {
    Name = "Codedang-DB-Subnet2"
  }
}

resource "aws_subnet" "private_db3" {
  vpc_id            = data.aws_vpc.main.id
  cidr_block        = "10.0.13.0/24"
  availability_zone = "ap-northeast-2c"

  tags = {
    Name = "Codedang-DB-Subnet3"
  }
}

resource "aws_db_subnet_group" "db_subnet_group" {
  name = "codedang-db-subnet-group"
  subnet_ids = [
    aws_subnet.private_db1.id,
    aws_subnet.private_db2.id,
    aws_subnet.private_db3.id
  ]
}

resource "aws_security_group" "db" {
  name        = "Codedang-SG-DB"
  description = "Allow DB inbound traffic"
  vpc_id      = data.aws_vpc.main.id

  ingress {
    description = "PostgreSQL"
    from_port   = var.postgres_port
    to_port     = var.postgres_port
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = {
    Name = "Codedang-SG-DB"
  }
}

resource "random_password" "postgres_password" {
  length  = 16
  special = false
}

resource "aws_db_instance" "postgres" {
  db_name           = "codedang_db"
  engine            = "postgres"
  engine_version    = "14.10"
  allocated_storage = 5
  instance_class    = "db.t4g.small"

  username = var.postgres_username
  password = random_password.postgres_password.result
  port     = var.postgres_port

  vpc_security_group_ids = [aws_security_group.db.id]
  db_subnet_group_name   = aws_db_subnet_group.db_subnet_group.name

  skip_final_snapshot = true
}
