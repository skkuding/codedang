terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # backend "s3" {
  #   bucket         = "codedang-terraform-state"
  #   key            = "terraform.tfstate"
  #   region         = "ap-northeast-2"
  #   encrypt        = true
  #   dynamodb_table = "terraform-state-lock"
  # }
}

provider "aws" {
  region = "ap-northeast-2"
  # Use credential created by AWS SSO, and specify it with environment variable
  # For example, if the name of profile is 'admin',
  # `AWS_PROFILE="admin" terraform plan`
  profile = var.profile
}

# S3 bucket for Terraform Backend
# resource "aws_s3_bucket" "tfstate" {
#   bucket = "codedang-terraform-state"
# }

# resource "aws_s3_bucket_versioning" "tfstate" {
#   bucket = aws_s3_bucket.tfstate.id
#   versioning_configuration {
#     status = "Enabled"
#   }
# }

# DynamoDB for Terraform State lock
# resource "aws_dynamodb_table" "tfstate" {
#   name         = "terraform-state-lock"
#   billing_mode = "PAY_PER_REQUEST"
#   hash_key     = "LockID"

#   attribute {
#     name = "LockID"
#     type = "S"
#   }
# }

############## NETWORKING ##############

resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"

  tags = {
    Name = "Codedang"
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "Codedang-InternetFacing"
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
    Name = "Codedang"
  }
}

resource "aws_subnet" "subnet_api_server" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.2.0/24"

  tags = {
    Name = "Codedang-API-Server-Subnet"
  }
}

resource "aws_route_table_association" "a" {
  subnet_id      = aws_subnet.proxy.id
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

############## ECS - Proxy ##############

resource "aws_subnet" "proxy" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"

  tags = {
    Name = "Codedang-Proxy-Subnet"
  }
}

resource "aws_ecs_cluster" "proxy" {
  name = "Codedang-Proxy"
}

resource "aws_ecs_service" "proxy" {
  name            = "Codedang-Proxy-Service"
  cluster         = aws_ecs_cluster.proxy.id
  task_definition = aws_ecs_task_definition.proxy.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    assign_public_ip = true
    security_groups  = [aws_security_group.allow_web.id]
    subnets          = [aws_subnet.proxy.id]
  }
}

resource "aws_ecs_task_definition" "proxy" {
  family                   = "Codedang-Proxy"
  requires_compatibilities = ["EC2"]
  network_mode             = "awsvpc"
  cpu                      = 512
  memory                   = 1024
  container_definitions    = file("proxy/task-definition.json")

  runtime_platform {
    operating_system_family = "LINUX"
  }
}

############## ECS - API Server ##############

# resource "aws_ecs_cluster" "main" {
#   name = "codedang"
# }

# # bug: destoying aws_ecs_service gets stuck
# # https://github.com/hashicorp/terraform-provider-aws/issues/3414
# resource "aws_ecs_service" "api_server" {
#   name            = "api-server"
#   cluster         = aws_ecs_cluster.main.id
#   task_definition = aws_ecs_task_definition.api_server.arn
#   desired_count   = 1
#   launch_type     = "FARGATE"

#   network_configuration {
#     assign_public_ip = true
#     security_groups  = [aws_security_group.allow_web.id]
#     subnets          = [aws_subnet.subnet_api_server.id]
#   }
# }

# resource "aws_ecs_task_definition" "api_server" {
#   family                   = "api-server"
#   requires_compatibilities = ["FARGATE"]
#   network_mode             = "awsvpc"
#   cpu                      = 512
#   memory                   = 1024
#   container_definitions    = file("backend/task-definition.json")

#   runtime_platform {
#     operating_system_family = "LINUX"
#   }
# }

############## Cloudfront - Frontend ##############

# resource "aws_s3_bucket" "frontend" {
#   bucket = "codedang-frontend"

#   tags = {
#     Name = "Codedang Frontend"
#   }
# }

# resource "aws_s3_bucket_public_access_block" "example" {
#   bucket = aws_s3_bucket.frontend.id

#   block_public_acls       = true
#   block_public_policy     = true
#   ignore_public_acls      = true
#   restrict_public_buckets = true
# }

# resource "aws_s3_bucket_acl" "frontend_acl" {
#   bucket = aws_s3_bucket.frontend.id
#   acl    = "private"
# }

# resource "aws_s3_object" "frontend" {
#   for_each = fileset("../frontend/dist", "**")

#   bucket       = aws_s3_bucket.frontend.id
#   key          = each.value
#   source       = "../frontend/dist/${each.value}"
#   content_type = lookup(jsondecode(file("mime.json")), regex("\\.[^.]+$", each.key), null)
# }

# data "aws_iam_policy_document" "s3_frontend" {
#   statement {
#     actions   = ["s3:GetObject"]
#     resources = ["${aws_s3_bucket.frontend.arn}/*"]

#     principals {
#       type        = "Service"
#       identifiers = ["cloudfront.amazonaws.com"]
#     }

#     condition {
#       test     = "StringEquals"
#       variable = "AWS:SourceArn"
#       values   = [aws_cloudfront_distribution.frontend.arn]
#     }
#   }
# }

# resource "aws_s3_bucket_policy" "frontend" {
#   bucket = aws_s3_bucket.frontend.id
#   policy = data.aws_iam_policy_document.s3_frontend.json
# }

# resource "aws_cloudfront_origin_access_control" "frontend" {
#   name                              = "Codedang Frontend"
#   description                       = "Accessing Codedang frontend static assets"
#   origin_access_control_origin_type = "s3"
#   signing_behavior                  = "always"
#   signing_protocol                  = "sigv4"
# }

# resource "aws_cloudfront_distribution" "frontend" {
#   origin {
#     domain_name              = aws_s3_bucket.frontend.bucket_domain_name
#     origin_id                = aws_s3_bucket.frontend.id
#     origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id
#   }

#   enabled             = true
#   comment             = "Codedang Frontend(Vue.js) Distribution"
#   default_root_object = "index.html"

#   default_cache_behavior {
#     allowed_methods        = ["GET", "HEAD", "OPTIONS"]
#     cached_methods         = ["GET", "HEAD", "OPTIONS"]
#     target_origin_id       = aws_s3_bucket.frontend.id
#     viewer_protocol_policy = "redirect-to-https"

#     forwarded_values {
#       query_string = true

#       cookies {
#         forward = "none"
#       }
#     }
#   }

#   restrictions {
#     geo_restriction {
#       restriction_type = "none"
#     }
#   }

#   viewer_certificate {
#     cloudfront_default_certificate = true
#   }

#   tags = {
#     "Environment" = "production"
#   }
# }
