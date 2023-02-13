terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = "ap-northeast-2"
  # Use credential created by AWS SSO, and specify it with environment variable
  # For example, if the name of profile is 'admin',
  # `AWS_PROFILE="admin" terraform plan`
}

resource "aws_instance" "my_server" {
  ami           = "ami-0e38c97339cddf4bd"
  instance_type = "t2.micro"
}
