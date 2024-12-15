# TODO: do not create IAM user, use EC2 instance profile instead
resource "aws_iam_user" "testcase" {
  name = "user-codedang-testcase"
  tags = {
    Description = "Admin에서 사용하는 Testcase 버킷 접속용 IAM User"
  }
}

data "aws_iam_policy_document" "testcase_get_put_delete_object" {
  statement {
    actions   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
    resources = ["${aws_s3_bucket.testcase.arn}/*"]
  }
}

resource "aws_iam_user_policy" "testcase" {
  name   = "codedang-testcase-s3"
  user   = aws_iam_user.testcase.name
  policy = data.aws_iam_policy_document.testcase_get_put_delete_object.json
}

resource "aws_iam_access_key" "testcase" {
  user = aws_iam_user.testcase.name
}
