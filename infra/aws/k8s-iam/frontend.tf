resource "aws_iam_user" "frontend" {
  name = "on-prem-frontend"
  tags = {
    Description = "Frontend on on-premise k8s cluster"
  }
}

resource "aws_iam_access_key" "frontend" {
  user = aws_iam_user.frontend.name
}

data "aws_iam_policy_document" "frontend_secret_read" {
  statement {
    actions   = ["secretsmanager:GetSecretValue"]
    resources = [local.instagram.instagram_token_arn]
  }
}

resource "aws_iam_user_policy" "frontend_secret_read" {
  name   = "codedang-frontend-secretmanager-read"
  user   = aws_iam_user.frontend.name
  policy = data.aws_iam_policy_document.frontend_secret_read.json
}
