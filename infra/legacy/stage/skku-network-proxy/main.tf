terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.100"
    }
  }

  backend "s3" {
    bucket         = "skku-network-proxy-tf-state"
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

output "public_ip" {
  value       = aws_eip.reverse_proxy_eip.public_ip
  description = "Elastic IP Address of the reverse proxy server"
}

output "public_dns" {
  value       = aws_eip.reverse_proxy_eip.public_dns
  description = "Public DNS of the reverse proxy server"
}
