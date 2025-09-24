resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"

  # Enabled to resolve RDS instance endpoint to private IPs
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "Codedang-VPC"
  }
}
