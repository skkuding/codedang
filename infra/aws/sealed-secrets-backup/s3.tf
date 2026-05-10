resource "aws_s3_bucket" "sealed_secrets_backup" {
  bucket = "codedang-sealed-secrets-backup"
  tags = {
    Description = "Backup destination for K8s sealed-secrets keys (per-cluster prefix)"
  }
}

resource "aws_s3_bucket_versioning" "sealed_secrets_backup" {
  bucket = aws_s3_bucket.sealed_secrets_backup.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "sealed_secrets_backup" {
  bucket = aws_s3_bucket.sealed_secrets_backup.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "sealed_secrets_backup" {
  bucket                  = aws_s3_bucket.sealed_secrets_backup.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "sealed_secrets_backup" {
  bucket = aws_s3_bucket.sealed_secrets_backup.id

  # Snapshots: keep 3 years (matches CronJob successfulJobsHistoryLimit=36).
  # S3 lifecycle prefix is bucket-rooted, so per-environment rules are needed.
  rule {
    id     = "expire-production-snapshots"
    status = "Enabled"
    filter {
      prefix = "production/snapshots/"
    }
    expiration {
      days = 1095
    }
  }

  rule {
    id     = "expire-stage-snapshots"
    status = "Enabled"
    filter {
      prefix = "stage/snapshots/"
    }
    expiration {
      days = 1095
    }
  }

  # Latest: keep noncurrent versions 1 year (versioning history of latest.json)
  rule {
    id     = "expire-noncurrent-latest"
    status = "Enabled"
    filter {
      prefix = ""
    }
    noncurrent_version_expiration {
      noncurrent_days = 365
    }
  }
}

output "sealed_secrets_backup_bucket_arn" {
  value = aws_s3_bucket.sealed_secrets_backup.arn
}

output "sealed_secrets_backup_bucket_name" {
  value = aws_s3_bucket.sealed_secrets_backup.id
}
