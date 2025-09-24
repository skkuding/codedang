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

resource "aws_launch_template" "openvpn" {
  name = "Codedang-OpenVPN-Server-Template"

  image_id      = "ami-0fd93ad619ce19e51" # Amazon Linux 2023 kernel-6.12, arm64
  instance_type = "t4g.micro"

  # NOTE: SSH access is available via AWS console or AWS CLI with the command below.
  # If there's no obvious reason, please do not add a key pair for minimizing security risk.
  #
  # aws ec2-instance-connect ssh --instance-id [INSTANCE-ID]
  #

  network_interfaces {
    subnet_id                   = aws_subnet.public_subnet.id
    security_groups             = [aws_security_group.openvpn.id]
    associate_public_ip_address = true
  }

  iam_instance_profile {
    name = aws_iam_instance_profile.openvpn.name
  }

  user_data = base64encode(templatefile("bootstrap.sh", {
    ip_address        = aws_eip.openvpn.public_ip,
    secret_id         = aws_secretsmanager_secret.openvpn.id,
    eip_allocation_id = aws_eip.openvpn.allocation_id
  }))

  tag_specifications {
    resource_type = "instance"

    tags = {
      Name = "Codedang-OpenVPN-Server"
    }
  }
}

resource "aws_autoscaling_group" "openvpn" {
  name = "Codedang-OpenVPN-Server-ASG"

  availability_zones = ["ap-northeast-2a"]
  desired_capacity   = 1
  max_size           = 1
  min_size           = 1

  launch_template {
    id      = aws_launch_template.openvpn.id
    version = aws_launch_template.openvpn.latest_version
  }
}
