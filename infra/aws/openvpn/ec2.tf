resource "aws_subnet" "public_subnet" {
  vpc_id            = local.vpc.vpc_id
  cidr_block        = "10.0.92.0/24"
  availability_zone = "ap-northeast-2a"

  tags = {
    Name = "Codedang-Public-OpenVPN-Subnet"
  }
}

resource "aws_route_table_association" "public_subnet" {
  subnet_id      = aws_subnet.public_subnet.id
  route_table_id = local.vpc.public_route_table_id
}

# TODO: replace with launch template and auto-scaling group
resource "aws_instance" "openvpn" {
  ami                         = "ami-0fd93ad619ce19e51" # Amazon Linux 2023 kernel-6.12, arm64
  instance_type               = "t4g.micro"
  subnet_id                   = aws_subnet.public_subnet.id
  vpc_security_group_ids      = [aws_security_group.openvpn.id]
  associate_public_ip_address = true

  iam_instance_profile = aws_iam_instance_profile.openvpn.name

  # NOTE: SSH access is available via AWS console or AWS CLI with the command below.
  # If there's no obvious reason, please do not add a key pair for minimizing security risk.
  #
  # aws ec2-instance-connect ssh --instance-id [INSTANCE-ID]
  #

  user_data = templatefile("bootstrap.sh", {
    ip_address = aws_eip.openvpn.public_ip,
    secret_id  = aws_secretsmanager_secret.openvpn.id
  })

  tags = {
    Name = "Codedang-OpenVPN-Server"
  }
}

# Allocate static IPv4 address for OpenVPN server
resource "aws_eip" "openvpn" {
  domain = "vpc"

  tags = {
    Name = "Codedang-OpenVPN-Server-EIP"
  }
}

# To decouple circular dependency between aws_instance and aws_eip,
# we need to associate EIP separately.
resource "aws_eip_association" "openvpn" {
  instance_id   = aws_instance.openvpn.id
  allocation_id = aws_eip.openvpn.id
}
