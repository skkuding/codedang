resource "aws_subnet" "private_redis1" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.31.0/24"
  availability_zone = var.availability_zones[0]

  tags = {
    Name = "Codedang_Redis-Subnet1"
  }
}
resource "aws_subnet" "private_redis2" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.32.0/24"
  availability_zone = var.availability_zones[1]

  tags = {
    Name = "Codedang_Redis-Subnet2"
  }
}

resource "aws_elasticache_replication_group" "db_cache" {
  automatic_failover_enabled = true
  # preferred_cache_cluster_azs = [var.availability_zones[0], var.availability_zones[1]]
  replication_group_id     = "elasticache-redis-codedang-1"
  description              = "Redis for codedang"
  node_type                = "cache.t3.micro"
  engine                   = "redis"
  parameter_group_name     = "default.redis7.cluster.on"
  engine_version           = "7.0"
  port                     = var.redis_port
  apply_immediately        = true
  snapshot_retention_limit = 0 # no backup

  num_node_groups         = 1 # number of shards
  replicas_per_node_group = 1 # replicas per shard

  security_group_ids = [aws_security_group.redis.id]
  subnet_group_name  = aws_elasticache_subnet_group.redis_subnet_group.name


  log_delivery_configuration {
    destination      = "/elasticache/redis"
    destination_type = "cloudwatch-logs"
    log_format       = "text"
    log_type         = "slow-log"
  }

  log_delivery_configuration {
    destination      = "/elasticache/redis"
    destination_type = "cloudwatch-logs"
    log_format       = "text"
    log_type         = "engine-log"
  }
}

resource "aws_elasticache_subnet_group" "redis_subnet_group" {
  name       = "Redis-subnet-group"
  subnet_ids = [aws_subnet.private_redis1.id, aws_subnet.private_redis2.id]
}

# resource "aws_elasticache_cluster" "codedang" {
#   cluster_id           = "cluster-codedang"
#   engine               = "redis"
#   node_type            = "cache.t3.micro"
#   num_cache_nodes      = 1
#   parameter_group_name = "default.redis7"
#   engine_version       = "7.0"
#   port                 = 6379

#   security_group_ids = [aws_security_group.redis.id]
#   availability_zone  = var.availability_zones[0]
#   subnet_group_name  = aws_elasticache_subnet_group.private_db.name

#   log_delivery_configuration {
#     destination      = "ecs/Codedang-Api"
#     destination_type = "cloudwatch-logs"
#     log_format       = "text"
#     log_type         = "slow-log"
#   }
# }

# resource "aws_subnet" "redis" {
#   vpc_id            = aws_vpc.main.id
#   cidr_block        = "10.0.20.0/24"
#   availability_zone = var.availability_zones[0]

#   tags = {
#     Name = "Codedang-REDIS-Subnet1"
#   }
# }
# resource "aws_elasticache_subnet_group" "private_db" {
#   name       = "elastiCache-subnet"
#   subnet_ids = [aws_subnet.redis.id]

# }
