resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "Codedang-Private-RT"
  }

  lifecycle {
    # Preserve the retired NAT route until its dedicated deletion change.
    ignore_changes = [route]
  }
}
