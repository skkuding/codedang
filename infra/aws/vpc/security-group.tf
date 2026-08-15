module "storage_security_groups" {
  source = "./modules/security-group"

  security_groups = {
    sg_db = {
      name        = "Codedang-SG-DB"
      tags_name   = "Codedang-SG-DB"
      description = "Allow DB inbound traffic"
      vpc_id      = aws_vpc.main.id
      ingress = [
        {
          description = "PostgreSQL"
          from_port   = var.postgres_port
          to_port     = var.postgres_port
          protocol    = "tcp"
          cidr_blocks = ["0.0.0.0/0"]
        },
        {
          description = "HTTPS"
          from_port   = 443
          to_port     = 443
          protocol    = "tcp"
          cidr_blocks = ["0.0.0.0/0"]
        }
      ]
    }
  }
}
