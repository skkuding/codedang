# Detach the surviving Redis subnet group without destroying it. The Redis
# cluster has already been removed from AWS and is not part of this transfer.
removed {
  from = aws_elasticache_subnet_group.redis_subnet_group

  lifecycle {
    destroy = false
  }
}
