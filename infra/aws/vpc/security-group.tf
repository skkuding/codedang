module "storage_security_groups" {
  source = "./modules/security-group"

  security_groups = {
    sg_db = {
      name        = "Codedang-SG-DB"
      tags_name   = "Codedang-SG-DB"
      description = "Allow DB inbound traffic"
      vpc_id      = aws_vpc.main.id
      ingress = [
        {
          description = "PostgreSQL"
          from_port   = var.postgres_port
          to_port     = var.postgres_port
          protocol    = "tcp"
          cidr_blocks = ["0.0.0.0/0"]
        },
        {
          description = "HTTPS"
          from_port   = 443
          to_port     = 443
          protocol    = "tcp"
          cidr_blocks = ["0.0.0.0/0"]
        }
      ]
    }
    sg_redis = {
      name        = "Codedang-SG-Redis"
      tags_name   = "Codedang-SG-Redis"
      description = "Allow Redis inbound traffic"
      vpc_id      = aws_vpc.main.id
      ingress = [
        {
          description = "Redis"
          from_port   = var.redis_port
          to_port     = var.redis_port
          protocol    = "tcp"
          cidr_blocks = ["0.0.0.0/0"]
        },
        {
          description = "HTTPS"
          from_port   = 443
          to_port     = 443
          protocol    = "tcp"
          cidr_blocks = ["0.0.0.0/0"]
        }
      ]
    }
  }
}

module "lb_security_groups" {
  source = "./modules/security-group"

  security_groups = {
    sg_admin = {
      name        = "Codedang-SG-LB-Admin"
      tags_name   = "Codedang-SG-LB-Admin"
      description = "Allow WEB inbound traffic"
      vpc_id      = aws_vpc.main.id
      ingress = [
        {
          description = "HTTP"
          from_port   = 80
          to_port     = 80
          protocol    = "tcp"
          cidr_blocks = ["0.0.0.0/0"]
        },
        {
          description = "HTTPS"
          from_port   = 443
          to_port     = 443
          protocol    = "tcp"
          cidr_blocks = ["0.0.0.0/0"]
        }
      ]
    }
    sg_client = {
      name        = "Codedang-SG-LB-Client"
      tags_name   = "Codedang-SG-LB-Client"
      description = "Allow WEB inbound traffic"
      vpc_id      = aws_vpc.main.id
      ingress = [
        {
          description = "HTTP"
          from_port   = 80
          to_port     = 80
          protocol    = "tcp"
          cidr_blocks = ["0.0.0.0/0"]
        },
        {
          description = "HTTPS"
          from_port   = 443
          to_port     = 443
          protocol    = "tcp"
          cidr_blocks = ["0.0.0.0/0"]
        }
      ]
    }
  }
}

module "ssh_security_groups" {
  source = "./modules/security-group"

  security_groups = {
    sg_ssh = {
      name        = "AllowSSH"
      tags_name   = "Codedang-AllowSSH"
      description = "Allow SSH for Codedang debug"
      vpc_id      = aws_vpc.main.id
      ingress = [
        {
          description = ""
          from_port   = 22
          to_port     = 22
          protocol    = "tcp"
          cidr_blocks = ["0.0.0.0/0"]
        }
      ]
    }
  }
}

module "app_security_groups" {
  source = "./modules/security-group"

  security_groups = {
    sg_ecs_api = {
      name        = "Codedang-SG-ECS-Api"
      tags_name   = "Codedang-SG-ECS-API"
      description = "Allow ECS inbound traffic"
      vpc_id      = aws_vpc.main.id
      ingress = [
        {
          description = "SSH"
          from_port   = 22
          to_port     = 22
          protocol    = "tcp"
          cidr_blocks = ["0.0.0.0/0"]
        },
        {
          description = "From ALB"
          from_port   = 32768
          to_port     = 65535
          protocol    = "tcp"

          security_groups = [
            module.lb_security_groups.security_group_ids["sg_admin"],
            module.lb_security_groups.security_group_ids["sg_client"]
          ]
        }
      ]
    }
    sg_ecs_iris = {
      name        = "Codedang-SG-Iris"
      tags_name   = "Codedang-SG-Iris"
      description = "Allow Message Queue inbound traffic"
      vpc_id      = aws_vpc.main.id
      ingress = [
        {
          description = "SSH"
          from_port   = 22
          to_port     = 22
          protocol    = "tcp"
          cidr_blocks = ["0.0.0.0/0"]
        },
        {
          description = "Iris"
          from_port   = var.rabbitmq_port
          to_port     = var.rabbitmq_port
          protocol    = "tcp"
          cidr_blocks = ["0.0.0.0/0"]
        }
      ]
    }
  }
}

module "nat_security_groups" {
  source = "./modules/security-group"

  security_groups = {
    sg_nat_instance = {
      name        = "Codedang-NAT-Instance"
      tags_name   = "Codedang-SG-NAT-Instance"
      description = "Allows Fluent-bit"
      vpc_id      = aws_vpc.main.id
      ingress = [
        {
          description = "Allow Bastion for ssh"
          from_port   = 22
          to_port     = 22
          protocol    = "tcp"
          security_groups = [
            module.ssh_security_groups.security_group_ids["sg_ssh"]
          ]
        },
        {
          description = "Allow all traffic from IRIS"
          from_port   = 0
          to_port     = 0
          protocol    = "-1"
          security_groups = [
            module.app_security_groups.security_group_ids["sg_ecs_iris"]
          ]
        },
        {
          description = "Allow RabbitMQ connection"
          from_port   = 5671
          to_port     = 5671
          protocol    = "tcp"
          security_groups = [
            module.app_security_groups.security_group_ids["sg_ecs_api"]
          ]
        },
        {
          description = "Allow all traffic from ECS API"
          from_port   = 0
          to_port     = 0
          protocol    = "-1"
          security_groups = [
            module.app_security_groups.security_group_ids["sg_ecs_api"]
          ]
        },
        # Stage-Server3
        {
          description = "Allow all traffic from stage-server3"
          from_port   = 0
          to_port     = 0
          protocol    = "-1"
          cidr_blocks = ["211.214.111.9/32"]
        },
      ]
    }
  }
}
