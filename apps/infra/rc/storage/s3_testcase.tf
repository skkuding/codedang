resource "aws_s3_bucket" "testcase" {
  bucket = var.env == "production" ? "codedang-testcase" : "codedang-testcase-rc"

  tags = {
    Name = "Codedang-Testcase"
  }
}

data "aws_iam_policy_document" "testcase_permissions" {
  statement {
    sid       = "AllowTestcaseRead"
    actions   = ["s3:ListBucket", "s3:GetObject"]
    resources = ["${aws_s3_bucket.testcase.arn}", "${aws_s3_bucket.testcase.arn}/*"]

    principals {
      type        = "*"
      identifiers = ["*"]
    }

    condition {
      test     = "StringEquals"
      variable = "aws:sourceVpce"
      values   = [local.network.vpc_endpoint]
    }
  }
}

resource "aws_s3_bucket_policy" "testcase" {
  bucket = aws_s3_bucket.testcase.id
  policy = data.aws_iam_policy_document.testcase_permissions.json
}
