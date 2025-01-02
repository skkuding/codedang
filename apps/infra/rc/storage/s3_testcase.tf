resource "aws_s3_bucket" "testcase" {
  bucket = var.env == "production" ? "codedang-testcase" : "codedang-testcase-rc"

  tags = {
    Name = "Codedang-Testcase"
  }
}

data "aws_iam_policy_document" "testcase_permissions" {
  statement {
    actions   = ["s3:ListBucket", "s3:GetObject"]
    resources = ["${aws_s3_bucket.testcase.arn}", "${aws_s3_bucket.testcase.arn}/*"]

    principals {
      type        = "*"
      identifiers = ["*"]
    }

    condition {
      test     = "IpAddress"
      variable = "AWS:SourceIp"
      values   = [local.network.public_ip]
    }
  }
}

resource "aws_s3_bucket_policy" "testcase" {
  bucket = aws_s3_bucket.testcase.id
  policy = data.aws_iam_policy_document.testcase_permissions.json
}
