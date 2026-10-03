output "bucket_name" {
  value = aws_s3_bucket.notion_backup.id
}

output "bucket_region" {
  value = local.region
}

output "kms_key_arn" {
  value = aws_kms_key.notion_backup.arn
}

output "object_prefix" {
  value = local.object_prefix
}

output "provisioner_role_arn" {
  value = aws_iam_role.provisioner.arn
}

output "writer_access_key_id" {
  value     = aws_iam_access_key.writer.id
  sensitive = true
}

output "writer_secret_access_key" {
  value     = aws_iam_access_key.writer.secret
  sensitive = true
}
