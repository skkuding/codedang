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

resource "aws_instance" "openvpn" {
  ami                         = "ami-0607797cadde98e9b" # Ubuntu Server 24.04 LTS, arm64
  instance_type               = "t4g.micro"
  subnet_id                   = aws_subnet.public_subnet.id
  vpc_security_group_ids      = [aws_security_group.openvpn.id]
  associate_public_ip_address = true

  # NOTE: SSH access is available via AWS console or AWS CLI with the command below.
  # If there's no obvious reason, please do not add a key pair for minimizing security risk.
  #
  # aws ec2-instance-connect ssh --instance-id [INSTANCE-ID] --os-user ubuntu
  #

  user_data = file("bootstrap.sh")

  tags = {
    Name = "Codedang-OpenVPN-Server"
  }
}

# Allocate static IPv4 address for OpenVPN server
resource "aws_eip" "openvpn" {
  instance = aws_instance.openvpn.id
  domain   = "vpc"

  tags = {
    Name = "Codedang-OpenVPN-Server-EIP"
  }
}
