resource "aws_db_subnet_group" "db_subnet_group" {
  name = "codedang-db-subnet-group"
  # TODO: change this to private subnets after migrating testcases from db to s3
  # After the migration, on-premise iris does not have to access the database
  subnet_ids = local.vpc.db_subnet_ids
}

resource "random_password" "postgres_password" {
  length  = 16
  special = false

}

# TODO(TAS-2888): Remove this group after the retained PostgreSQL 14 old blue
# instance is deleted, no earlier than 2026-09-03 23:40 KST and only with
# separate approval.
resource "aws_db_parameter_group" "postgres14_logical" {
  name        = "codedang-postgres14-logical"
  family      = "postgres14"
  description = "PostgreSQL 14 source parameters for the PostgreSQL 18 blue-green migration"

  parameter {
    name         = "rds.logical_replication"
    value        = "1"
    apply_method = "pending-reboot"
  }

  parameter {
    name  = "wal_sender_timeout"
    value = "0"
  }

  parameter {
    name         = "max_replication_slots"
    value        = "20"
    apply_method = "pending-reboot"
  }

  parameter {
    name         = "max_wal_senders"
    value        = "20"
    apply_method = "pending-reboot"
  }

  # Three user databases plus one table-synchronization reserve.
  parameter {
    name         = "max_logical_replication_workers"
    value        = "4"
    apply_method = "pending-reboot"
  }

  # Eight parallel workers, four logical workers, one launcher, and three spare.
  parameter {
    name         = "max_worker_processes"
    value        = "16"
    apply_method = "pending-reboot"
  }
}

resource "aws_db_parameter_group" "postgres18" {
  name        = "codedang-postgres18"
  family      = "postgres18"
  description = "PostgreSQL 18 target parameters for the blue-green migration"

  parameter {
    name         = "rds.force_ssl"
    value        = "1"
    apply_method = "pending-reboot"
  }

  # TODO(TAS-2888): Review removal of the migration-only replication tuning
  # below after the seven-day stability window and Terraform reconciliation.
  # Resetting static parameters may require a separately approved reboot.
  parameter {
    name  = "wal_receiver_timeout"
    value = "0"
  }

  parameter {
    name         = "max_replication_slots"
    value        = "20"
    apply_method = "pending-reboot"
  }

  parameter {
    name         = "max_logical_replication_workers"
    value        = "4"
    apply_method = "pending-reboot"
  }

  parameter {
    name         = "max_worker_processes"
    value        = "16"
    apply_method = "pending-reboot"
  }
}

resource "aws_db_instance" "postgres" {
  identifier = "terraform-20250506182211604800000001"

  db_name = "codedang_db"
  engine  = "postgres"
  # Pinned version — check for updates quarterly: https://docs.aws.amazon.com/AmazonRDS/latest/PostgreSQLReleaseNotes/
  engine_version             = "18.4"
  auto_minor_version_upgrade = false
  allocated_storage          = 30
  max_allocated_storage      = 100
  storage_type               = "gp3"
  instance_class             = "db.t4g.small"
  parameter_group_name       = aws_db_parameter_group.postgres18.name

  username = var.postgres_username
  password = random_password.postgres_password.result
  port     = var.postgres_port

  # Temporarily expose database to public for on-premise iris
  # TODO: remove this after migrating testcase from db to s3
  publicly_accessible = true

  vpc_security_group_ids = [local.vpc.security_group_ids["sg_db"]]
  db_subnet_group_name   = aws_db_subnet_group.db_subnet_group.name #currently using public subnet group
  availability_zone      = "ap-northeast-2b"

  # Backup
  backup_retention_period = 7
  backup_window           = "16:00-17:00" # KST 01:00-02:00

  # Monitoring
  performance_insights_enabled = true

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
    url = local.database_url
  })
}
