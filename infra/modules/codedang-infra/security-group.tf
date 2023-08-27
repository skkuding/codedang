resource "aws_security_group" "client_lb" {
  name        = "Codedang-SG-LB-Client"
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
    Name = "Codedang-SG-LB-Client"
  }
}

resource "aws_security_group" "admin_lb" {
  name        = "Codedang-SG-LB-Admin"
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
    Name = "Codedang-SG-LB-Admin"
  }
}

resource "aws_security_group" "ecs_api" {
  name        = "Codedang-SG-ECS-Api"
  description = "Allow ECS inbound traffic"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "From ALB"
    from_port   = 32768
    to_port     = 65535
    protocol    = "tcp"
    security_groups = [
      aws_security_group.client_lb.id,
      aws_security_group.admin_lb.id
    ]
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = {
    Name = "Codedang-SG-ECS-API"
  }
}

resource "aws_security_group" "iris" {
  name        = "Codedang-SG-Iris"
  description = "Allow Message Queue inbound traffic"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "Iris"
    from_port   = var.rabbitmq_port
    to_port     = var.rabbitmq_port
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
    Name = "Codedang-SG-Iris"
  }
}

resource "aws_security_group" "db" {
  name        = "Codedang-SG-DB"
  description = "Allow DB inbound traffic"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "PostgreSQL"
    from_port   = var.postgres_port
    to_port     = var.postgres_port
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
    Name = "Codedang-SG-DB"
  }
}

resource "aws_security_group" "redis" {
  name        = "Codedang-SG-Redis"
  description = "Allow Redis inbound traffic"
  vpc_id      = aws_vpc.main.id

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

resource "aws_security_group" "mq" {
  name        = "Codedang-SG-MQ"
  description = "Allow Message inbound traffic"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "MQ"
    from_port   = var.rabbitmq_port
    to_port     = var.rabbitmq_port
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
    Name = "Codedang-SG-MQ"
  }
}
