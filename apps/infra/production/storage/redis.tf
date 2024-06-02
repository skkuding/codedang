resource "aws_subnet" "private_redis1" {
  vpc_id            = data.aws_vpc.main.id
  cidr_block        = "10.0.31.0/24"
  availability_zone = "ap-northeast-2a"

  tags = {
    Name = "Codedang_Redis-Subnet1"
  }
}

resource "aws_subnet" "private_redis2" {
  vpc_id            = data.aws_vpc.main.id
  cidr_block        = "10.0.32.0/24"
  availability_zone = "ap-northeast-2b"

  tags = {
    Name = "Codedang_Redis-Subnet2"
  }
}

resource "aws_security_group" "redis" {
  name        = "Codedang-SG-Redis"
  description = "Allow Redis inbound traffic"
  vpc_id      = data.aws_vpc.main.id

  ingress {
    description = "Redis"
    from_port   = var.redis_port
    to_port     = var.redis_port
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
    Name = "Codedang-SG-Redis"
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
