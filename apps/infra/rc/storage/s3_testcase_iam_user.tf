# TODO: do not create IAM user, use EC2 instance profile instead
resource "aws_iam_user" "testcase" {
  name = "user-codedang-testcase"
  tags = {
    Description = "Admin에서 사용하는 Testcase 버킷 접속용 IAM User"
  }
}

data "aws_iam_policy_document" "testcase_write" {
  statement {
    actions   = ["s3:ListBucket", "s3:GetObject", "s3:PutObject", "s3:PutObjectTagging", "s3:DeleteObject"]
    resources = ["${aws_s3_bucket.testcase.arn}", "${aws_s3_bucket.testcase.arn}/*"]
  }
}

resource "aws_iam_user_policy" "testcase" {
  name   = "codedang-testcase-s3-write"
  user   = aws_iam_user.testcase.name
  policy = data.aws_iam_policy_document.testcase_write.json
}

resource "aws_iam_access_key" "testcase" {
  user = aws_iam_user.testcase.name
}

resource "aws_iam_user" "iris_on_prem" {
  name = "iris-on-prem"
  tags = {
    Description = "On-premise Iris에서 Testcase 버킷을 접속하는 IAM User"
  }
}

data "aws_iam_policy_document" "testcase_read" {
  statement {
    actions   = ["s3:ListBucket", "s3:GetObject", "s3:GetObjectTagging"]
    resources = ["${aws_s3_bucket.testcase.arn}", "${aws_s3_bucket.testcase.arn}/*"]
  }
}

resource "aws_iam_user_policy" "iris_testcase_read" {
  name   = "codedang-testcase-s3-read"
  user   = aws_iam_user.iris_on_prem.name
  policy = data.aws_iam_policy_document.testcase_read.json
}
