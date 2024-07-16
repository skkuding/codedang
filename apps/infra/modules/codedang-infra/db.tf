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
