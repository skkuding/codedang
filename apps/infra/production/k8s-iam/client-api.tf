resource "aws_iam_user" "client_api" {
  name = "on-prem-client-api"
  tags = {
    Description = "Client API on on-premise k8s cluster"
  }
}

resource "aws_iam_access_key" "client_api" {
  user = aws_iam_user.client_api.name
}

data "aws_iam_policy_document" "client_api" {
  statement {
    actions   = ["secretsmanager:GetSecretValue"]
    resources = [local.storage.database_secret_arn]
  }

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

resource "aws_iam_user_policy" "client_api" {
  name   = "codedang-client-api-secretsmanager"
  user   = aws_iam_user.client_api.name
  policy = data.aws_iam_policy_document.client_api_secret_read.json
}
