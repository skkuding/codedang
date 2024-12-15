resource "aws_security_group" "this" {
  for_each = var.security_groups

  name = each.value.name
  tags = {
    Name = each.value.tags_name
  }

  description = each.value.description
  vpc_id      = each.value.vpc_id

  ingress = each.value.ingress

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }
}
