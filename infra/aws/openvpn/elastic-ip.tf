# Allocate static IPv4 address to OpenVPN server
# Actual association is done in bootstrap.sh to ensure it happens even if the instance is replaced by ASG
resource "aws_eip" "openvpn" {
  domain = "vpc"

  tags = {
    Name = "Codedang-OpenVPN-Server-EIP"
  }
}
