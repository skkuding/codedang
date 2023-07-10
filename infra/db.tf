locals {
  # postgres_url = "postgresql://skkuding:password@:5433/skkuding?schema=public"
  postgres_url = "postgresql://${var.postgres_username}:${var.postgres_password}@${aws_rds_cluster.cluster.endpoint}:${var.postgres_port}/skkuding?schema=public"
}

resource "aws_subnet" "private_db1" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.11.0/24"
  availability_zone = var.availability_zones[0]

  tags = {
    Name = "Codedang-DB-Subnet1"
  }
}

resource "aws_subnet" "private_db2" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.12.0/24"
  availability_zone = var.availability_zones[1]

  tags = {
    Name = "Codedang-DB-Subnet2"
  }
}

resource "aws_subnet" "private_db3" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.13.0/24"
  availability_zone = var.availability_zones[2]

  tags = {
    Name = "Codedang-DB-Subnet3"
  }
}

resource "aws_rds_cluster" "cluster" {
  engine             = "aurora-postgresql"
  engine_version     = "14.7"
  cluster_identifier = "codedang-db"
  master_username    = var.postgres_username
  master_password    = var.postgres_password

  db_subnet_group_name   = aws_db_subnet_group.db_subnet_group.name
  vpc_security_group_ids = [aws_security_group.db.id]
  port                   = 5433

  backup_retention_period = 1
  skip_final_snapshot     = true
}

resource "aws_rds_cluster_instance" "cluster_instances" {
  count              = 2
  identifier         = "codedang-db-instance-${count.index}"
  cluster_identifier = aws_rds_cluster.cluster.id
  instance_class     = "db.t3.medium"
  engine             = aws_rds_cluster.cluster.engine
  engine_version     = aws_rds_cluster.cluster.engine_version

  publicly_accessible = false
}

resource "aws_db_subnet_group" "db_subnet_group" {
  name = "codedang-db-subnet-group"
  subnet_ids = [
    aws_subnet.private_db1.id,
    aws_subnet.private_db2.id,
    aws_subnet.private_db3.id
  ]
}
