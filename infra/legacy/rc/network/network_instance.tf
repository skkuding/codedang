resource "aws_instance" "nat_instance" {
  ami                    = "ami-08271b263d7b4ae11"
  instance_type          = "t4g.micro"
  subnet_id              = module.public_api_subnets.subnet_ids["public_nat"]
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
    Name = "NAT-Instance"
  }
}

resource "aws_instance" "bastion_host" {
  ami                    = "ami-0c68ab5091e5f073a"
  instance_type          = "t4g.nano"
  subnet_id              = module.public_api_subnets.subnet_ids["public_bastion"]
  vpc_security_group_ids = [module.ssh_security_groups.security_group_ids["sg_ssh"]]
  key_name               = "bastion-host"
  tags = {
    Name = "Bastion-Host"
  }
}
