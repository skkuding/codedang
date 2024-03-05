resource "aws_s3_bucket" "media" {
  bucket = "codedang-media"

  tags = {
    Name = "Codedang-Media"
  }
}

# public access for objects
resource "aws_s3_bucket_public_access_block" "block_public_access" {
  bucket                  = aws_s3_bucket.media.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

data "aws_iam_policy_document" "media_permissions" {
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
  policy = data.aws_iam_policy_document.media_permissions.json
}

# user for admin api
resource "aws_iam_user" "media" {
  name = "user-codedang-media"
}

data "aws_iam_policy_document" "media_s3" {
  statement {
    actions   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
    resources = ["${aws_s3_bucket.media.arn}/*"]
  }
}

resource "aws_iam_user_policy" "media_s3" {
  name   = "codedang-media-s3"
  user   = aws_iam_user.media.name
  policy = data.aws_iam_policy_document.media_s3.json
}

resource "aws_iam_access_key" "media" {
  user = aws_iam_user.media.name
}
