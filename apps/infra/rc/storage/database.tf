resource "aws_db_subnet_group" "db_subnet_group" {
  name = "codedang-db-subnet-group"
  subnet_ids = [
    local.network.subnet_ids["private_db1"],
    local.network.subnet_ids["private_db2"],
    local.network.subnet_ids["private_db3"]
  ]
}

resource "random_password" "postgres_password" {
  length  = 16
  special = false
}

resource "aws_db_instance" "postgres" {
  db_name           = "codedang_db"
  engine            = "postgres"
  engine_version    = "14"
  allocated_storage = 5
  instance_class    = "db.t4g.small"

  username = var.postgres_username
  password = random_password.postgres_password.result
  port     = var.postgres_port

  vpc_security_group_ids = [local.network.security_group_ids["sg_db"]]
  db_subnet_group_name   = aws_db_subnet_group.db_subnet_group.name

  skip_final_snapshot = true
}
