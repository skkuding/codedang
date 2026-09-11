locals {
  failover_subnets = {
    public_1 = {
      id             = "subnet-0f14810e78522af18"
      cidr           = "10.0.90.0/24"
      az             = "ap-northeast-2a"
      route_table_id = "rtb-0d852dfe803de34d5"
      association_id = "rtbassoc-07c74683150c38bcb"
    }
    public_2 = {
      id             = "subnet-028f4169bce791463"
      cidr           = "10.0.91.0/24"
      az             = "ap-northeast-2c"
      route_table_id = "rtb-0d852dfe803de34d5"
      association_id = "rtbassoc-003b9cc0490007d4c"
    }
    nat = {
      id             = "subnet-0a7a9278da142f6c1"
      cidr           = "10.0.93.0/24"
      az             = "ap-northeast-2a"
      route_table_id = "rtb-0d852dfe803de34d5"
      association_id = "rtbassoc-0d37a968a7e20f64a"
    }
    bastion = {
      id             = "subnet-020c4615492911ea7"
      cidr           = "10.0.255.32/28"
      az             = "ap-northeast-2a"
      route_table_id = "rtb-0d852dfe803de34d5"
      association_id = "rtbassoc-015607367b1e35e9d"
    }
    api_1 = {
      id             = "subnet-034077a1c5d99bc93"
      cidr           = "10.0.1.0/24"
      az             = "ap-northeast-2a"
      route_table_id = "rtb-0b1db0a507940f8a8"
      association_id = "rtbassoc-059267dff18528f51"
    }
    api_2 = {
      id             = "subnet-075b9b446bc449471"
      cidr           = "10.0.2.0/24"
      az             = "ap-northeast-2c"
      route_table_id = "rtb-0b1db0a507940f8a8"
      association_id = "rtbassoc-0cd59afbee6556bec"
    }
    admin_1 = {
      id             = "subnet-081f636eea31fb9e1"
      cidr           = "10.0.3.0/24"
      az             = "ap-northeast-2a"
      route_table_id = "rtb-0b1db0a507940f8a8"
      association_id = "rtbassoc-037138883f1191149"
    }
    admin_2 = {
      id             = "subnet-0a851d48f56a465c2"
      cidr           = "10.0.4.0/24"
      az             = "ap-northeast-2c"
      route_table_id = "rtb-0b1db0a507940f8a8"
      association_id = "rtbassoc-0be054f842595d050"
    }
    iris_1 = {
      id             = "subnet-0153fdc0e0292da7e"
      cidr           = "10.0.41.0/24"
      az             = "ap-northeast-2a"
      route_table_id = "rtb-0b1db0a507940f8a8"
      association_id = "rtbassoc-03597cfdf7d4e5082"
    }
    iris_2 = {
      id             = "subnet-0b1ef5a250f3cb2a8"
      cidr           = "10.0.42.0/24"
      az             = "ap-northeast-2c"
      route_table_id = "rtb-0b1db0a507940f8a8"
      association_id = "rtbassoc-044be5af0dfb46c13"
    }
    redis_1 = {
      id             = "subnet-0f069bd2825bf11b1"
      cidr           = "10.0.31.0/24"
      az             = "ap-northeast-2a"
      route_table_id = "rtb-0b1db0a507940f8a8"
      association_id = "rtbassoc-085fc417880ae3ee5"
    }
    redis_2 = {
      id             = "subnet-0ccb58e3b590f4e00"
      cidr           = "10.0.32.0/24"
      az             = "ap-northeast-2b"
      route_table_id = "rtb-0b1db0a507940f8a8"
      association_id = "rtbassoc-035328c12f5ee4901"
    }
    mq = {
      id             = "subnet-0f8e880adb8c8c87c"
      cidr           = "10.0.101.0/24"
      az             = "ap-northeast-2a"
      route_table_id = "rtb-0b1db0a507940f8a8"
      association_id = "rtbassoc-0c60585d6135c3dbf"
    }
    grafana_agent = {
      id             = "subnet-0c213f740af6947b6"
      cidr           = "10.0.24.0/24"
      az             = "ap-northeast-2a"
      route_table_id = "rtb-0b1db0a507940f8a8"
      association_id = "rtbassoc-03649d96699f3c83c"
    }
    jaeger = {
      id             = "subnet-04e9dca06e80da77d"
      cidr           = "10.0.100.0/24"
      az             = "ap-northeast-2a"
      route_table_id = "rtb-0b1db0a507940f8a8"
      association_id = "rtbassoc-0859f904a4d5f0b98"
    }
  }

  failover_security_groups = {
    redis  = { id = "sg-078098cf29b05ab47", name = "Codedang-SG-Redis" }
    admin  = { id = "sg-05fa5678a7fba7220", name = "Codedang-SG-LB-Admin" }
    client = { id = "sg-0e68addb696b12229", name = "Codedang-SG-LB-Client" }
    ssh    = { id = "sg-0a4ab81625b14f76d", name = "AllowSSH" }
    api    = { id = "sg-0ecbf08e8c514fb0d", name = "Codedang-SG-ECS-Api" }
    iris   = { id = "sg-0aae13b8d77742236", name = "Codedang-SG-Iris" }
    nat    = { id = "sg-07d973c3586840c71", name = "Codedang-NAT-Instance" }
  }
}

# These unused ECS, MQ, Redis, host, and experiment subnets are retired together.
resource "aws_subnet" "failover" {
  for_each = local.failover_subnets

  vpc_id            = local.vpc_id
  cidr_block        = each.value.cidr
  availability_zone = each.value.az

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}

# These associations exist only to route the retired subnets above.
resource "aws_route_table_association" "failover" {
  for_each = local.failover_subnets

  subnet_id      = aws_subnet.failover[each.key].id
  route_table_id = each.value.route_table_id

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}

# These security groups protect only retired failover resources.
resource "aws_security_group" "failover" {
  for_each = local.failover_security_groups

  name   = each.value.name
  vpc_id = local.vpc_id

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}

# This NAT instance has been stopped since 2025 and serves no active workload.
resource "aws_instance" "nat" {
  ami                    = "ami-08271b263d7b4ae11"
  instance_type          = "t4g.micro"
  subnet_id              = aws_subnet.failover["nat"].id
  vpc_security_group_ids = [aws_security_group.failover["nat"].id]

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}

# This bastion has been stopped since 2025 and serves no active workload.
resource "aws_instance" "bastion" {
  ami                    = "ami-0c68ab5091e5f073a"
  instance_type          = "t4g.nano"
  subnet_id              = aws_subnet.failover["bastion"].id
  vpc_security_group_ids = [aws_security_group.failover["ssh"].id]

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}

# The AWS Redis cluster is gone, leaving this subnet group as residue.
resource "aws_elasticache_subnet_group" "redis" {
  name       = "redis-subnet-group"
  subnet_ids = [aws_subnet.failover["redis_1"].id, aws_subnet.failover["redis_2"].id]

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}

import {
  for_each = local.failover_subnets
  to       = aws_subnet.failover[each.key]
  id       = each.value.id
}

import {
  for_each = local.failover_subnets
  to       = aws_route_table_association.failover[each.key]
  id       = "${each.value.id}/${each.value.route_table_id}"
}

import {
  for_each = local.failover_security_groups
  to       = aws_security_group.failover[each.key]
  id       = each.value.id
}

import {
  to = aws_instance.nat
  id = "i-0d67c562eb58f3190"
}

import {
  to = aws_instance.bastion
  id = "i-06bf9c09e71704c47"
}

import {
  to = aws_elasticache_subnet_group.redis
  id = "redis-subnet-group"
}
