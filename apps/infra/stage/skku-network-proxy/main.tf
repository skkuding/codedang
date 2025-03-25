terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.75"
    }
  }

  backend "s3" {
    bucket         = "skku-network-proxy-tf-state-rc"
    key            = "terraform/skku-network-proxy.tfstate"
    region         = "ap-northeast-2"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}

provider "aws" {
  region = "ap-northeast-2"
}

resource "aws_eip" "reverse_proxy_eip" {
  instance = aws_instance.reverse_proxy.id
  domain   = "vpc"

  tags = {
    Name = "reverse-proxy-eip"
  }
}

# 출력 정의
output "public_ip" {
  value       = aws_eip.reverse_proxy_eip.public_ip
  description = "리버스 프록시 서버의 퍼블릭 IP 주소"
}

output "public_dns" {
  value       = aws_eip.reverse_proxy_eip.public_dns
  description = "리버스 프록시 서버의 퍼블릭 DNS"
}
