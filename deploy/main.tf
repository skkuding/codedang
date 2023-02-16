terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }

  # backend "s3" {
  #   bucket = "codedang"
  #   key    = "terraform"
  #   region = "ap-northeast-2"
  # }
}

provider "aws" {
  region = "ap-northeast-2"
  # Use credential created by AWS SSO, and specify it with environment variable
  # For example, if the name of profile is 'admin',
  # `AWS_PROFILE="admin" terraform plan`
}

############## NETWORKING ##############

resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"

  tags = {
    Name = "codedang-main"
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "codedang-main"
  }
}

resource "aws_route_table" "main" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  route {
    ipv6_cidr_block = "::/0"
    gateway_id      = aws_internet_gateway.main.id
  }

  tags = {
    Name = "codedang-main"
  }
}

resource "aws_subnet" "subnet_traefik" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"

  tags = {
    Name = "codedang-traefik-subnet"
  }
}

resource "aws_route_table_association" "a" {
  subnet_id      = aws_subnet.subnet_traefik.id
  route_table_id = aws_route_table.main.id
}

resource "aws_security_group" "allow_web" {
  name        = "allow_web"
  description = "Allow WEB inbound traffic"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Traefik Dashboard"
    from_port   = 8080
    to_port     = 8080
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
    Name = "allow_web"
  }
}

# resource "aws_network_interface" "main" {
#   subnet_id       = aws_subnet.subnet_traefik.id
#   private_ips     = ["10.0.1.50"]
#   security_groups = [aws_security_group.allow_web.id]
# }

# resource "aws_eip" "lb" {
#   vpc                       = true
#   network_interface         = aws_network_interface.main.id
#   associate_with_private_ip = "10.0.1.50"
#   depends_on = [
#     aws_internet_gateway.main
#   ]
# }

############## ECS - traefik ##############

resource "aws_ecs_cluster" "main" {
  name = "codedang"
}

resource "aws_ecs_service" "proxy" {
  name            = "traefik"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.traefik.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    assign_public_ip = true
    security_groups  = [aws_security_group.allow_web.id]
    subnets          = [aws_subnet.subnet_traefik.id]
  }
}

resource "aws_ecs_task_definition" "traefik" {
  family                   = "traefik"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 512
  memory                   = 1024
  container_definitions    = file("task-definitions/traefik.json")

  runtime_platform {
    operating_system_family = "LINUX"
  }
}
