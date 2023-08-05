# S3 bucket for Terraform Backend
resource "aws_s3_bucket" "tfstate" {
  bucket = "codedang-tf-state"
}

resource "aws_s3_bucket_versioning" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id
  versioning_configuration {
    status = "Enabled"
  }
}

# # DynamoDB for Terraform State lock
resource "aws_dynamodb_table" "tfstate" {
  name         = "terraform-state-lock"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}
