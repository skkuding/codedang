# Bucket for internal files, such as configuration files
resource "aws_s3_bucket" "internal" {
  bucket = "codedang-internal"

  tags = {
    Name = "Codedang-Internal"
  }
}

resource "aws_s3_object" "fluent_bit_config_file" {
  bucket = aws_s3_bucket.internal.id
  key    = "fluent-bit.conf"
  source = "./fluent-bit.conf"
  etag   = filemd5("./fluent-bit.conf")

  # This will ensure the file is re-uploaded if its content changes
  content_type = "text/plain"
}

data "aws_iam_policy_document" "read_fluent_bit_config" {
  statement {
    actions   = ["s3:ListBucket", "s3:GetObject", "s3:GetBucketLocation"]
    resources = [aws_s3_bucket.internal.arn, aws_s3_object.fluent_bit_config_file.arn]

    principals {
      type        = "AWS"
      identifiers = [aws_iam_role.ecs_task_execution_role.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "aws:PrincipalServiceName"
      values   = ["ecs.amazonaws.com"]
    }
  }
}

resource "aws_s3_bucket_policy" "fluent_bit_config" {
  bucket = aws_s3_bucket.internal.id
  policy = data.aws_iam_policy_document.read_fluent_bit_config.json
}
