resource "aws_s3_bucket" "notion_backup" {
  bucket        = local.bucket_name
  force_destroy = false

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_ownership_controls" "notion_backup" {
  bucket = aws_s3_bucket.notion_backup.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_public_access_block" "notion_backup" {
  bucket                  = aws_s3_bucket.notion_backup.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "notion_backup" {
  bucket = aws_s3_bucket.notion_backup.id

  versioning_configuration {
    status = "Enabled"
  }

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "notion_backup" {
  bucket = aws_s3_bucket.notion_backup.id

  rule {
    bucket_key_enabled = true

    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.notion_backup.arn
      sse_algorithm     = "aws:kms"
    }
  }

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "notion_backup" {
  bucket = aws_s3_bucket.notion_backup.id

  rule {
    id     = "abort-incomplete-multipart-uploads"
    status = "Enabled"

    filter {}

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}

data "aws_iam_policy_document" "notion_backup_bucket" {
  statement {
    sid     = "DenyInsecureTransport"
    effect  = "Deny"
    actions = ["s3:*"]
    resources = [
      aws_s3_bucket.notion_backup.arn,
      "${aws_s3_bucket.notion_backup.arn}/*",
    ]

    principals {
      type        = "*"
      identifiers = ["*"]
    }

    condition {
      test     = "Bool"
      variable = "aws:SecureTransport"
      values   = ["false"]
    }
  }

  statement {
    sid     = "DenyUploadsWithoutKMS"
    effect  = "Deny"
    actions = ["s3:PutObject"]
    resources = [
      "${aws_s3_bucket.notion_backup.arn}/${local.object_prefix}/*",
    ]

    principals {
      type        = "*"
      identifiers = ["*"]
    }

    condition {
      test     = "StringNotEquals"
      variable = "s3:x-amz-server-side-encryption"
      values   = ["aws:kms"]
    }
  }

  statement {
    sid     = "DenyUploadsWithWrongKMSKey"
    effect  = "Deny"
    actions = ["s3:PutObject"]
    resources = [
      "${aws_s3_bucket.notion_backup.arn}/${local.object_prefix}/*",
    ]

    principals {
      type        = "*"
      identifiers = ["*"]
    }

    condition {
      test     = "StringNotEquals"
      variable = "s3:x-amz-server-side-encryption-aws-kms-key-id"
      values   = [aws_kms_key.notion_backup.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "notion_backup" {
  bucket = aws_s3_bucket.notion_backup.id
  policy = data.aws_iam_policy_document.notion_backup_bucket.json

  depends_on = [aws_s3_bucket_public_access_block.notion_backup]

  lifecycle {
    prevent_destroy = true
  }
}
