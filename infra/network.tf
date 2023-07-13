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

resource "aws_route_table_association" "client_api1" {
  subnet_id      = aws_subnet.public_client_api1.id
  route_table_id = aws_route_table.main.id
}

resource "aws_route_table_association" "client_api2" {
  subnet_id      = aws_subnet.public_client_api2.id
  route_table_id = aws_route_table.main.id
}
resource "aws_route_table_association" "admin_api1" {
  subnet_id      = aws_subnet.public_admin_api1.id
  route_table_id = aws_route_table.main.id
}
resource "aws_route_table_association" "admin_api2" {
  subnet_id      = aws_subnet.public_admin_api2.id
  route_table_id = aws_route_table.main.id
}

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

resource "aws_security_group" "client_ecs" {
  name        = "Codedang-SG-Client-ECS"
  description = "Allow ECS inbound traffic"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "From ALB"
    from_port       = 0
    to_port         = 63353
    protocol        = "tcp"
    security_groups = [aws_security_group.client_lb.id]
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = {
    Name = "Codedang-SG-Client-ECS"
  }
}

resource "aws_security_group" "admin_ecs" {
  name        = "Codedang-SG-Admin-ECS"
  description = "Allow ECS inbound traffic"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "From ALB"
    from_port       = 0
    to_port         = 63353
    protocol        = "tcp"
    security_groups = [aws_security_group.admin_lb.id]
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = {
    Name = "Codedang-SG-Admin-ECS"
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
    from_port   = 6379
    to_port     = 6379
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
