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

# Aurora - PostgreSQL
# resource "aws_rds_cluster" "cluster" {
#   engine             = "aurora-postgresql"
#   engine_version     = "14.7"
#   cluster_identifier = "codedang-db"
#   master_username    = var.postgres_username
#   master_password    = var.postgres_password

#   db_subnet_group_name   = aws_db_subnet_group.db_subnet_group.name
#   vpc_security_group_ids = [aws_security_group.db.id]
#   port                   = 5433

#   backup_retention_period = 1
#   skip_final_snapshot     = true
# }

# resource "aws_rds_cluster_instance" "cluster_instances" {
#   count              = 1
#   identifier         = "codedang-db-instance-${count.index}"
#   cluster_identifier = aws_rds_cluster.cluster.id
#   instance_class     = "db.t4g.medium"
#   engine             = aws_rds_cluster.cluster.engine
#   engine_version     = aws_rds_cluster.cluster.engine_version

#   publicly_accessible = false
# }

# PostgreSQL - TEST ==> 테스트용
resource "aws_db_instance" "db-test" {
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

resource "aws_db_subnet_group" "db_subnet_group" {
  name = "codedang-db-subnet-group"
  subnet_ids = [
    aws_subnet.private_db1.id,
    aws_subnet.private_db2.id,
    aws_subnet.private_db3.id
  ]
}
