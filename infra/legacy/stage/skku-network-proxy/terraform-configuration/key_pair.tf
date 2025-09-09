resource "aws_s3_bucket" "key_pair" {
  bucket = "codedang-key-pair-skku-network-proxy"
}

module "key_pairs" {
  source = "./modules/key_pair"

  bucket_name = aws_s3_bucket.key_pair.bucket
  key_names   = ["skku-network-proxy"]
  env         = var.env
}
