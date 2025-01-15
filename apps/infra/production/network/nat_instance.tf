resource "aws_instance" "nat_instance" {
  ami                    = "ami-08271b263d7b4ae11"
  instance_type          = "t4g.micro"
  subnet_id              = var.nat_subnet_id
  vpc_security_group_ids = [module.nat_security_groups.security_group_ids["sg_nat_instance"]]
  source_dest_check      = false
  key_name               = "nat-instance"

  user_data = <<-EOF
              #!/bin/bash
              # 1. iptables 서비스 활성화
              sudo yum install -y iptables-services
              sudo systemctl enable iptables
              sudo systemctl start iptables

              # 2. IP 포워딩 활성화 및 영구 설정
              echo "net.ipv4.ip_forward = 1" | sudo tee /etc/sysctl.d/custom-ip-forwarding.conf
              sudo sysctl -p /etc/sysctl.d/custom-ip-forwarding.conf

              # 3. iptables NAT 설정
              # t4g 시리즈는 Nitro 기반이므로 ens5 사용 (주의!)
              sudo iptables -t nat -A POSTROUTING -o ens5 -j MASQUERADE
              sudo iptables -F FORWARD
              sudo service iptables save
              EOF

  tags = {
    Name = "Codedang-NAT-Instance"
  }
}

resource "aws_eip" "nat_instance" {
  instance = aws_instance.nat_instance.id

  tags = {
    Name = "Codedang-NAT-Instance"
  }
}
