# Plag uses this bucket for production results, so it is permanent storage.
resource "aws_s3_bucket" "plag_checks" {
  bucket = "codedang-plag-checks"

  lifecycle {
    prevent_destroy = true
  }
}

# Adopt the bucket's existing access controls without changing live behavior.
resource "aws_s3_bucket_public_access_block" "plag_checks" {
  bucket = aws_s3_bucket.plag_checks.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

import {
  to = aws_s3_bucket.plag_checks
  id = "codedang-plag-checks"
}

import {
  to = aws_s3_bucket_public_access_block.plag_checks
  id = "codedang-plag-checks"
}
