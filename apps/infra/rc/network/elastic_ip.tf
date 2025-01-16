resource "aws_eip" "nat_instance" {
  instance = aws_instance.nat_instance.id

  tags = {
    Name = "Codedang-NAT-Instance"
  }
}

resource "aws_eip" "bastion_host" {
  instance = aws_instance.bastion_host.id

  tags = {
    Name = "Codedang-Bastion-Host"
  }
}
