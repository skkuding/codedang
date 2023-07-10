resource "aws_elasticache_cluster" "codedang" {
  cluster_id           = "cluster-codedang"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  engine_version       = "3.2.10"
  port                 = 6379
  security_group_ids   = [aws_security_group.redis.id]
  availability_zone    = var.availiability_zones[0]
  subnet_group_name    = aws_elasticache_subnet_group.private_db.name

  log_delivery_configuration {
    destination      = "ecs/Codedang-Api"
    destination_type = "cloudwatch-logs"
    log_format       = "text"
    log_type         = "slow-log"
  }
}

resource "aws_subnet" "redis" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.20.0/24"
  availability_zone = var.availability_zones[0]

  tags = {
    Name = "Codedang-REDIS-Subnet1"
  }
}
resource "aws_elasticache_subnet_group" "private_db" {
  name       = "elastiCache_subnet"
  subnet_ids = [aws_subnet.redis.id]

}
