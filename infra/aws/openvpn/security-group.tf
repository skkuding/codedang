resource "aws_security_group" "openvpn" {
  name        = "Codedang-SG-OpenVPN"
  description = "Allow OpenVPN traffic"
  vpc_id      = local.vpc.vpc_id
  tags = {
    Name = "Codedang-SG-OpenVPN"
  }
}

resource "aws_vpc_security_group_ingress_rule" "ssh" {
  security_group_id = aws_security_group.openvpn.id

  cidr_ipv4   = "0.0.0.0/0"
  from_port   = 22 # SSH default port
  to_port     = 22
  ip_protocol = "tcp"
}

resource "aws_vpc_security_group_ingress_rule" "openvpn" {
  security_group_id = aws_security_group.openvpn.id

  cidr_ipv4   = "0.0.0.0/0"
  from_port   = 1194 # OpenVPN default port
  to_port     = 1194
  ip_protocol = "udp"
}

resource "aws_vpc_security_group_egress_rule" "anywhere" {
  security_group_id = aws_security_group.openvpn.id

  cidr_ipv4   = "0.0.0.0/0"
  ip_protocol = -1 # all protocols
}
