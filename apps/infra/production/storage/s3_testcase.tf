resource "aws_s3_bucket" "testcase" {
  bucket = "codedang-testcase"

  tags = {
    Name = "Codedang-Testcase"
  }
}

data "aws_eip" "nat" {
  tags = {
    Name = "Codedang-NAT-Instance"
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
      values   = [data.aws_eip.nat.public_ip]
    }
  }
}

resource "aws_s3_bucket_policy" "testcase" {
  bucket = aws_s3_bucket.testcase.id
  policy = data.aws_iam_policy_document.testcase_permissions.json
}
