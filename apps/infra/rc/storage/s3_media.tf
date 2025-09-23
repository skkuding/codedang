resource "aws_s3_bucket" "media" {
  bucket = var.env == "production" ? "codedang-media" : "codedang-media-rc"

  tags = {
    Name = "Codedang-Media"
  }
}

resource "aws_s3_bucket_public_access_block" "media_access" {
  bucket                  = aws_s3_bucket.media.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

data "aws_iam_policy_document" "media_get_object" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.media.arn}/*"]

    principals {
      type        = "*"
      identifiers = ["*"]
    }
  }
}

resource "aws_s3_bucket_policy" "media" {
  bucket = aws_s3_bucket.media.id
  policy = data.aws_iam_policy_document.media_get_object.json
}
