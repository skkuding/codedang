resource "aws_s3_bucket" "key_pair" {
  bucket = var.env == "production" ? "codedang-key-pair" : "codedang-key-pair-rc"
}

module "key_pairs" {
  source = "./modules/key_pair"

  bucket_name = aws_s3_bucket.key_pair.bucket
  key_names   = ["bastion-host", "nat-instance", "codedang-ecs-api-instance", "codedang-ecs-iris-instance"]
  env         = var.env
}