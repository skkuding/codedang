# TODO: ECS쪽에 추가하기!!!!
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
