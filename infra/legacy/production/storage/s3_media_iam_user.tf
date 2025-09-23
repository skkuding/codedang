resource "aws_iam_user" "media" {
  name = "user-codedang-media"
  tags = {
    Description = "Admin에서 사용하는 Media 버킷 접속용 IAM User"
  }
}

data "aws_iam_policy_document" "media_get_put_delete_object" {
  statement {
    actions   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
    resources = ["${aws_s3_bucket.media.arn}/*"]
  }
}

resource "aws_iam_user_policy" "media" {
  name   = "codedang-media-s3"
  user   = aws_iam_user.media.name
  policy = data.aws_iam_policy_document.media_get_put_delete_object.json
}

resource "aws_iam_access_key" "media" {
  user = aws_iam_user.media.name
}
