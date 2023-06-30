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
  region  = "ap-northeast-2"
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

resource "aws_route_table_association" "proxy1" {
  subnet_id      = aws_subnet.proxy1.id
  route_table_id = aws_route_table.main.id
}

resource "aws_route_table_association" "proxy2" {
  subnet_id      = aws_subnet.proxy2.id
  route_table_id = aws_route_table.main.id
}

resource "aws_security_group" "allow_web" {
  name        = "Codedang-AllowWeb"
  description = "Allow WEB inbound traffic"
  vpc_id      = aws_vpc.main.id

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

############## Cloudfront ##############

resource "aws_cloudfront_origin_access_control" "main" {
  name                              = "Codedang-Cloudfront-S3-OAI"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "main" {
  origin {
    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id                = aws_s3_bucket.frontend.id
    origin_access_control_id = aws_cloudfront_origin_access_control.main.id
  }

  enabled             = true
  comment             = "Codedang Cloudfront"
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]
    target_origin_id       = aws_s3_bucket.frontend.id
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = true

      cookies {
        forward = "none"
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none" # Allow cache from all countries
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true # Enforce HTTPS
  }

  # Redirect non-root path to root path (need for SPA)
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }
}

############## ECS - Proxy ##############

resource "aws_subnet" "proxy1" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "ap-northeast-2a"

  tags = {
    Name = "Codedang-Proxy-Subnet1"
  }
}

resource "aws_subnet" "proxy2" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "ap-northeast-2c"

  tags = {
    Name = "Codedang-Proxy-Subnet2"
  }
}

resource "aws_ecs_cluster" "proxy" {
  name = "Codedang-Proxy"
}

resource "aws_lb" "proxy" {
  name               = "Codedang-Proxy-Load-Balancer"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.allow_web.id]
  subnets            = [aws_subnet.proxy1.id, aws_subnet.proxy2.id]
  enable_http2       = true
}

resource "aws_lb_listener" "proxy" {
  load_balancer_arn = aws_lb.proxy.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.proxy.arn
  }
}

resource "aws_lb_target_group" "proxy" {
  name        = "Codedang-Proxy-Target-Group"
  target_type = "ip"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
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
    subnets          = [aws_subnet.proxy1.id, aws_subnet.proxy2.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.proxy.arn
    container_name   = "Codedang-Proxy"
    container_port   = 80
  }

  depends_on = [
    aws_lb_listener.proxy
  ]
}

resource "aws_ecs_task_definition" "proxy" {
  family                   = "Codedang-Proxy"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 512
  memory                   = 1024
  container_definitions    = file("proxy/task-definition.json")

  runtime_platform {
    operating_system_family = "LINUX"
  }
}

############## S3 - Frontend ##############

resource "aws_s3_bucket" "frontend" {
  bucket = var.s3_bucket

  tags = {
    Name = "Codedang"
  }
}

resource "aws_s3_object" "frontend" {
  for_each = fileset("../frontend/dist", "**")

  bucket       = aws_s3_bucket.frontend.id
  key          = each.value
  source       = "../frontend/dist/${each.value}"
  content_type = lookup(jsondecode(file("mime.json")), regex("\\.[^.]+$", each.key), null)
}

resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

data "aws_iam_policy_document" "cloudfront_s3" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.frontend.arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.main.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  policy = data.aws_iam_policy_document.cloudfront_s3.json
}
