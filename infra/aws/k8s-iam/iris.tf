resource "aws_iam_user" "iris" {
  name = "on-prem-iris"
  tags = {
    Description = "Iris on on-premise k8s cluster"
  }
}

resource "aws_iam_access_key" "iris" {
  user = aws_iam_user.iris.name
}

data "aws_iam_policy_document" "iris_secret_read" {
  statement {
    actions   = ["secretsmanager:GetSecretValue"]
    resources = [local.storage.database_secret_arn]
  }
}

resource "aws_iam_user_policy" "iris_secret_read" {
  name   = "codedang-iris-secretmanager-read"
  user   = aws_iam_user.iris.name
  policy = data.aws_iam_policy_document.iris_secret_read.json
}

data "aws_iam_policy_document" "iris_s3_read" {
  statement {
    actions = [
      "s3:ListBucket", # required to read objects
      "s3:GetObject",
    ]
    resources = [
      "arn:aws:s3:::codedang-testcase",
      "arn:aws:s3:::codedang-testcase/*",
    ]
  }
}

resource "aws_iam_user_policy" "iris_s3_read" {
  name   = "codedang-iris-s3-read"
  user   = aws_iam_user.iris.name
  policy = data.aws_iam_policy_document.iris_s3_read.json
}
