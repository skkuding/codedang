resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"

  # Not a recommended setting for production environment,
  # but temporarily enabled to put RDS instance in public subnet.
  # TODO: disable this and use default after setting up VPN
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "Codedang-VPC"
  }
}
