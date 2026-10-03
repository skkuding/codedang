resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "Codedang-Private-RT"
  }

  lifecycle {
    # The retired NAT route was removed. This route table still carries the S3
    # gateway endpoint route managed by infra/aws/storage, so leave routes
    # unmanaged here.
    ignore_changes = [route]
  }
}
