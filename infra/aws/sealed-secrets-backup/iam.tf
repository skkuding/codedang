resource "aws_iam_user" "sealed_secrets_backup" {
  name = "sealed-secrets-backup"
  tags = {
    Description = "Used by K8s CronJob to backup Sealed Secrets keys"
  }
}

resource "aws_iam_access_key" "sealed_secrets_backup" {
  user = aws_iam_user.sealed_secrets_backup.name
}

data "aws_iam_policy_document" "sealed_secrets_backup" {
  # Legacy: Secrets Manager backup destination, kept read-only for fallback access
  # during migration to S3. Removed in a follow-up cleanup PR.
  statement {
    sid = "SecretsManagerLegacyRead"
    actions = [
      "secretsmanager:GetSecretValue",
      "secretsmanager:DescribeSecret",
    ]
    resources = [
      aws_secretsmanager_secret.sealed_secrets_prod.arn,
      aws_secretsmanager_secret.sealed_secrets_stage.arn,
    ]
  }

  statement {
    sid = "S3BackupBucketList"
    actions = [
      "s3:ListBucket",
    ]
    resources = [
      aws_s3_bucket.sealed_secrets_backup.arn,
    ]
  }

  statement {
    sid = "S3BackupObjectReadWrite"
    actions = [
      "s3:PutObject",
      "s3:GetObject",
    ]
    resources = [
      "${aws_s3_bucket.sealed_secrets_backup.arn}/*",
    ]
  }
}

resource "aws_iam_user_policy" "sealed_secrets_backup" {
  name   = "sealed-secrets-backup"
  user   = aws_iam_user.sealed_secrets_backup.name
  policy = data.aws_iam_policy_document.sealed_secrets_backup.json
}

output "access_key_id" {
  value = aws_iam_access_key.sealed_secrets_backup.id
}

output "secret_access_key" {
  value     = aws_iam_access_key.sealed_secrets_backup.secret
  sensitive = true
}
