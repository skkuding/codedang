module "lb_security_groups" {
  source = "./modules/security_group"

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
  source = "./modules/security_group"

  security_groups = {
    sg_ssh = {
      name        = "Codedang-AllowSSH"
      tags_name   = "Codedang-AllowSSH"
      description = "Allow SSH for Codedang debug"
      vpc_id      = aws_vpc.main.id
      ingress = [
        {
          description = "SSH"
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
  source = "./modules/security_group"
  #depends_on = [module.storage_security_groups]

  security_groups = {
    sg_ecs_api = {
      name        = "Codedang-SG-ECS-Api"
      tags_name   = "Codedang-SG-ECS-Api"
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
  source = "./modules/security_group"
  #depends_on = [module.app_security_groups, module.ssh_security_groups]

  security_groups = {
    sg_nat_instance = {
      name        = "Codedang-SG-NAT-Instance"
      tags_name   = "Codedang-SG-NAT-Instance"
      description = "Allow Fluent-bit and Other NAT traffic"
      vpc_id      = aws_vpc.main.id
      ingress = [
        {
          description = "Allow Bastion for SSH"
          from_port   = 22
          to_port     = 22
          protocol    = "tcp"
          security_groups = [
            module.ssh_security_groups.security_group_ids["sg_ssh"]
          ]
        },
        {
          description = "Allow All Traffics from IRIS"
          from_port   = 0
          to_port     = 0
          protocol    = "-1"
          security_groups = [
            module.app_security_groups.security_group_ids["sg_ecs_iris"]
          ]
        },
        {
          description = "Allow RabbitMQ Connection"
          from_port   = 5671
          to_port     = 5671
          protocol    = "tcp"
          security_groups = [
            module.app_security_groups.security_group_ids["sg_ecs_api"]
          ]
        },
        {
          description = "Allow ECS API for Log Data"
          from_port   = 443
          to_port     = 443
          protocol    = "tcp"
          security_groups = [
            module.app_security_groups.security_group_ids["sg_ecs_api"]
          ]
        },
        {
          description = "Allow ECS API for Log Data"
          from_port   = 3101
          to_port     = 3101
          protocol    = "tcp"
          security_groups = [
            module.app_security_groups.security_group_ids["sg_ecs_api"]
          ]
        },
        {
          description = "Allow ECS API for metric, trace data"
          from_port   = 4318
          to_port     = 4318
          protocol    = "tcp"
          security_groups = [
            module.app_security_groups.security_group_ids["sg_ecs_api"]
          ]
        },
      ]
    }
  }
}

