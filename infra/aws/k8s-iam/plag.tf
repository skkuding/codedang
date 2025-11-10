resource "aws_iam_user" "plag" {
  name = "on-prem-plag"
  tags = {
    Description = "Plag on on-premise k8s cluster"
  }
}

resource "aws_iam_access_key" "plag" {
  user = aws_iam_user.plag.name
}

data "aws_iam_policy_document" "plag_secret_read" {
  statement {
    actions   = ["secretsmanager:GetSecretValue"]
    resources = [local.storage.database_secret_arn]
  }
}

resource "aws_iam_user_policy" "plag_secret_read" {
  name   = "codedang-plag-secretmanager-read"
  user   = aws_iam_user.plag.name
  policy = data.aws_iam_policy_document.plag_secret_read.json
}

data "aws_iam_policy_document" "plag_s3_write" {
  statement {
    actions = [
      "s3:PutObject",
      "s3:PutObjectTagging",
      "s3:DeleteObject",
    ]
    resources = [
      "arn:aws:s3:::codedang-plag-checks",
      "arn:aws:s3:::codedang-plag-checks/*",
    ]
  }
}

resource "aws_iam_user_policy" "plag_s3_write" {
  name   = "codedang-plag-s3-write"
  user   = aws_iam_user.plag.name
  policy = data.aws_iam_policy_document.plag_s3_write.json
}

output "plag_aws_iam_user_policy" {
  value = aws_iam_user_policy.plag_s3_write.id
}

output "plag_iam_user_access_key_id" {
  description = "Access key ID for the plag IAM user"
  value       = aws_iam_access_key.plag.id
}

output "plag_iam_user_secret_access_key" {
  description = "Secret access key for the plag IAM user. This is sensitive and stored in plaintext in the state file."
  value       = aws_iam_access_key.plag.secret
  sensitive   = true
}
