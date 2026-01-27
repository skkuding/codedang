resource "aws_db_subnet_group" "db_subnet_group" {
  name = "codedang-db-subnet-group"
  # TODO: change this to private subnets after migrating testcases from db to s3
  # After the migration, on-premise iris does not have to access the database
  subnet_ids = local.network.db_subnet_ids
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
  identifier = "terraform-20250506182211604800000001"

  db_name           = "codedang_db"
  engine            = "postgres"
  engine_version    = "14"
  allocated_storage = 5
  instance_class    = "db.t4g.small"

  username = var.postgres_username
  password = random_password.postgres_password.result
  port     = var.postgres_port

  # Temporarily expose database to public for on-premise iris
  # TODO: remove this after migrating testcase from db to s3
  publicly_accessible = true

  vpc_security_group_ids = [aws_security_group.db.id]
  db_subnet_group_name   = aws_db_subnet_group.db_subnet_group.name #currently using public subnet group
  availability_zone      = "ap-northeast-2b"

  # Take a snapshot before deleting the instance
  skip_final_snapshot       = false
  final_snapshot_identifier = "codedang-db-final-snapshot"
  snapshot_identifier       = "codedang-db-final-snapshot-20260120"


  lifecycle {
    create_before_destroy = true
    # ⭐ 추가: username, snapshot_identifier 변경 시 재생성 방지
    ignore_changes = [
      username,
      snapshot_identifier, #remove this line if you want to recreate instance from snapshot_identifier
      availability_zone
    ]
  }

  deletion_protection = true
}

# Secret to share with on-premise kubernetes cluster
resource "aws_secretsmanager_secret" "database" {
  name = "Codedang-Database-Secret"
}

resource "aws_secretsmanager_secret_version" "database" {
  secret_id = aws_secretsmanager_secret.database.id
  secret_string = jsonencode({
    url = "postgres://${aws_db_instance.postgres.username}:${random_password.postgres_password.result}@${aws_db_instance.postgres.address}:${aws_db_instance.postgres.port}/skkuding?schema=public&connection_limit=20"
  })
}
