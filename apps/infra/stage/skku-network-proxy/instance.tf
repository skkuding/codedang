# EC2 인스턴스 생성
resource "aws_instance" "reverse_proxy" {
  ami                    = "ami-0d5bb3742db8fc264" # Ubuntu 24.04
  instance_type          = "t2.micro"
  key_name               = "skku-network-proxy"
  subnet_id              = aws_subnet.public_subnet.id
  vpc_security_group_ids = [aws_security_group.proxy_sg.id]

  # 인스턴스 초기화 스크립트
  user_data = <<-EOF
    #!/bin/bash
    apt-get update -y
    apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
    apt-get update -y
    apt-get install -y caddy

    # 로그 디렉토리 생성
    mkdir -p /var/log/caddy

    # Caddy 설정 파일 생성
    cat > /etc/caddy/Caddyfile <<'EOL'
    ${file("${path.module}/Caddyfile")}
    EOL

    systemctl restart caddy
    systemctl enable caddy
  EOF

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  tags = {
    Name = "reverse-proxy-server"
  }
}
