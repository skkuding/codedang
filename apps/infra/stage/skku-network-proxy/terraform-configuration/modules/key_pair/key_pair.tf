resource "tls_private_key" "this" {
  for_each  = toset(var.key_names)
  algorithm = "RSA"
  rsa_bits  = 2048
}

resource "aws_key_pair" "this" {
  for_each   = tls_private_key.this
  key_name   = each.key
  public_key = each.value.public_key_openssh
}

resource "aws_s3_object" "this" {
  for_each = toset(var.key_names)
  bucket   = var.bucket_name
  key      = "${each.key}.pem"
  content  = tls_private_key.this[each.key].private_key_pem
}