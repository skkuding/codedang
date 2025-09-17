# Allocate static IPv4 address to OpenVPN server
resource "aws_eip" "openvpn" {
  domain = "vpc"

  tags = {
    Name = "Codedang-OpenVPN-Server-EIP"
  }
}

data "aws_instances" "openvpn" {
  # CRITICAL: This ensures Terraform creates the ASG and it launches the instance
  # BEFORE this data source tries to find it.
  depends_on = [aws_autoscaling_group.openvpn]

  instance_tags = {
    Name = "Codedang-OpenVPN-Server"
  }

  instance_state_names = ["running"]
}

# NOTE: If EC2 instance is terminated and replaced by ASG, the association will be lost.
# In that case, you need to re-run `terraform apply` to re-associate the EIP to the new instance.
resource "aws_eip_association" "openvpn" {
  instance_id   = data.aws_instances.openvpn.ids[0]
  allocation_id = aws_eip.openvpn.id
}
