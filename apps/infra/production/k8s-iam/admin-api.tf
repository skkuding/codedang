resource "aws_iam_user" "admin_api" {
  name = "on-prem-admin-api"
  tags = {
    Description = "Admin API on on-premise k8s cluster"
  }
}

resource "aws_iam_access_key" "admin_api" {
  user = aws_iam_user.admin_api.name
}

data "aws_iam_policy_document" "admin_api_secret_read" {
  statement {
    actions   = ["secretsmanager:GetSecretValue"]
    resources = [local.storage.database_secret_arn]
  }
}

resource "aws_iam_user_policy" "admin_api_secret_read" {
  name   = "codedang-admin-api-secretmanager-read"
  user   = aws_iam_user.admin_api.name
  policy = data.aws_iam_policy_document.admin_api_secret_read.json
}

data "aws_iam_policy_document" "admin_api_s3_read" {
  statement {
    actions = [
      "s3:ListBucket", # required to read objects
      "s3:GetObject",
    ]
    resources = [
      "arn:aws:s3:::codedang-testcase",
      "arn:aws:s3:::codedang-testcase/*",
      "arn:aws:s3:::codedang-media",
      "arn:aws:s3:::codedang-media/*",
    ]
  }
}

resource "aws_iam_user_policy" "admin_api_s3_read" {
  name   = "codedang-admin-api-s3-read"
  user   = aws_iam_user.admin_api.name
  policy = data.aws_iam_policy_document.admin_api_s3_read.json
}
