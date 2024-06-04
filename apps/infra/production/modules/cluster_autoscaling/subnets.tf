data "aws_vpc" "main" {
  tags = {
    Name = "Codedang-VPC"
  }
}

resource "aws_subnet" "this" {
  for_each          = var.subnets
  vpc_id            = data.aws_vpc.main.id
  cidr_block        = each.value.cidr_block
  availability_zone = each.value.availability_zone

  tags = {
    Name = each.value.tags_name
  }
}

resource "aws_security_group" "this" {
  name        = var.security_group.name
  description = var.security_group.description
  vpc_id      = data.aws_vpc.main.id

  ingress = [
    {
      description = "SSH"
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]

      ipv6_cidr_blocks = []
      prefix_list_ids  = []
      security_groups  = []
      self             = false
    },
    var.security_group.ingress
  ]

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = {
    Name = var.security_group.tags_name
  }
}
