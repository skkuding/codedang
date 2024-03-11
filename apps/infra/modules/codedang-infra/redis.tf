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

  security_group_ids = [aws_security_group.redis.id]
  subnet_group_name  = aws_elasticache_subnet_group.redis_subnet_group.name

  log_delivery_configuration {
    destination      = "/elasticache/redis"
    destination_type = "cloudwatch-logs"
    log_format       = "text"
    log_type         = "slow-log"
  }
}
resource "aws_elasticache_subnet_group" "redis_subnet_group" {
  name       = "Redis-subnet-group"
  subnet_ids = [aws_subnet.private_redis1.id, aws_subnet.private_redis2.id]
}
