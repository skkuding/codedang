resource "aws_elasticache_subnet_group" "redis_subnet_group" {
  name = "Redis-subnet-group"
  subnet_ids = [
    local.network.subnet_ids["private_redis1"],
    local.network.subnet_ids["private_redis2"]
  ]
}


resource "aws_elasticache_cluster" "db_cache" {
  cluster_id               = "elasticache-redis-codedang-1"
  engine                   = "redis"
  node_type                = "cache.t3.micro"
  num_cache_nodes          = 1
  parameter_group_name     = "default.redis7"
  engine_version           = "7.0"
  port                     = var.redis_port
  apply_immediately        = true
  snapshot_retention_limit = 0 # no backup

  security_group_ids = [local.network.security_group_ids["sg_redis"]]
  subnet_group_name  = aws_elasticache_subnet_group.redis_subnet_group.name

  log_delivery_configuration {
    destination      = "/elasticache/redis"
    destination_type = "cloudwatch-logs"
    log_format       = "text"
    log_type         = "slow-log"
  }
}
