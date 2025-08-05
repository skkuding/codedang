resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"

  # TODO: remove this after migrating testcase from db to s3
  # This is only for exposing the database to on-premise iris
  # We don't need to let database publicly accessible after migration
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "Codedang-VPC"
  }
}
