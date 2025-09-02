resource "aws_iam_user" "client_api_stage" {
  name = "on-prem-client-api-stage"
  tags = {
    Description = "Client API on on-premise stage k8s cluster. Required for accessing SES to send emails."
  }
}

resource "aws_iam_access_key" "client_api_stage" {
  user = aws_iam_user.client_api_stage.name
}

data "aws_iam_policy_document" "client_api_stage_ses_send" {
  statement {
    actions = [
      "ses:SendEmail",
      "ses:SendRawEmail",
    ]
    resources = ["*"]
  }
}

resource "aws_iam_user_policy" "client_api_stage_ses_send" {
  name   = "codedang-client-api-stage-ses-send"
  user   = aws_iam_user.client_api_stage.name
  policy = data.aws_iam_policy_document.client_api_stage_ses_send.json
}
