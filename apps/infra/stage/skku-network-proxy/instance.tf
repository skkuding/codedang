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
    {
      # 전역 설정
      servers {
        timeouts {
          idle 2m
        }
      }
    }

    stage-proxy.codedang.com {
      handle /api/* {
        @options method OPTIONS
        handle @options {
          header {
            Access-Control-Allow-Origin {header.Origin}
            Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE"
            Access-Control-Allow-Headers "Content-Type, Authorization, Email-Auth, Apollo-Require-Preflight"
            Access-Control-Allow-Credentials true
            Access-Control-Max-Age 7200
          }
          respond "" 204
        }

        handle {
          reverse_proxy https://stage.codedang.com {
            header_up Host stage.codedang.com
            header_up X-Forwarded-For ""
            header_up X-Real-IP ""

            transport http {
              tls
              tls_insecure_skip_verify
            }
          }

          header {
            Access-Control-Allow-Origin {header.Origin}
            Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE"
            Access-Control-Allow-Headers "Content-Type, Authorization, Email-Auth, Apollo-Require-Preflight"
            Access-Control-Allow-Credentials true
            Access-Control-Expose-Headers "Email-Auth"

            # 보안 헤더
            Strict-Transport-Security "max-age=31536000; includeSubDomains"
            X-Content-Type-Options "nosniff"
            X-Frame-Options "DENY"
            X-XSS-Protection "1; mode=block"

            defer
          }
        }
      }

      # GraphQL 요청 처리
      handle /graphql {
        @options method OPTIONS
        handle @options {
          header {
            Access-Control-Allow-Origin {header.Origin}
            Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE"
            Access-Control-Allow-Headers "Content-Type, Authorization, Email-Auth, Apollo-Require-Preflight"
            Access-Control-Allow-Credentials true
            Access-Control-Max-Age 7200
          }
          respond "" 204
        }

        # 실제 GraphQL 요청 프록시
        handle {
          reverse_proxy https://stage.codedang.com {
            header_up Host stage.codedang.com
            header_up X-Forwarded-For ""
            header_up X-Real-IP ""

            transport http {
              tls
              tls_insecure_skip_verify
            }
          }

          header {
            Access-Control-Allow-Origin {header.Origin}
            Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE"
            Access-Control-Allow-Headers "Content-Type, Authorization, Email-Auth, Apollo-Require-Preflight"
            Access-Control-Allow-Credentials true
            Access-Control-Expose-Headers "Email-Auth"

            # 보안 헤더
            Strict-Transport-Security "max-age=31536000; includeSubDomains"
            X-Content-Type-Options "nosniff"
            X-Frame-Options "DENY"
            X-XSS-Protection "1; mode=block"

            defer
          }
        }
      }

      handle /bucket* {
        reverse_proxy https://stage.codedang.com {
          header_up Host stage.codedang.com
        }
      }

      handle /console* {
        reverse_proxy https://stage.codedang.com {
          header_up Host stage.codedang.com
        }
      }

      handle /logs* {
        reverse_proxy https://stage.codedang.com {
          header_up Host stage.codedang.com
        }
      }

      # 기본 응답
      handle {
        respond "SKKU API Proxy Server" 200
      }

      log {
        output file /var/log/caddy/stage-proxy-access.log {
          roll_size 50MB
          roll_keep 10
        }
        format json {
          time_format iso8601
          time_key timestamp
          message_key message
        }
      }
    }

    http://stage-proxy.codedang.com {
      redir https://stage-proxy.codedang.com{uri} permanent
    }
    EOL

    # Caddy 서비스 재시작
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
