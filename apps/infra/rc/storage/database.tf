resource "aws_db_subnet_group" "db_subnet_group" {
  name = "codedang-db-subnet-group"
  subnet_ids = [
    local.network.subnet_ids["public_db1"],
    local.network.subnet_ids["public_db2"],
    local.network.subnet_ids["public_db3"]
  ]
}

resource "random_password" "postgres_password" {
  length  = 16
  special = false
}

resource "aws_db_instance" "postgres" {
  db_name             = "codedang_db"
  engine              = "postgres"
  engine_version      = "14"
  allocated_storage   = 5
  instance_class      = "db.t4g.small"
  snapshot_identifier = "arn:aws:rds:ap-northeast-2:219857217698:snapshot:rc-snapshot"

  username = var.postgres_username
  password = random_password.postgres_password.result
  port     = var.postgres_port

  # Temporarily expose database to public for on-premise iris
  # TODO: remove this after migrating testcase from db to s3
  publicly_accessible = true

  vpc_security_group_ids = [local.network.security_group_ids["sg_db"]]
  db_subnet_group_name   = aws_db_subnet_group.db_subnet_group.name

  # Take a snapshot of the database before deletion
  skip_final_snapshot = false
}
