resource "aws_iam_role" "ecs_task_role" {
  name               = "Codedang-API-Task-Role"
  description        = "ECS task 위의 app이 다른 aws 서비스를 사용할 수 있는 권한"
  assume_role_policy = data.aws_iam_policy_document.task_assume_role.json
}

data "aws_iam_policy_document" "ses_send_email" {
  statement {
    actions   = ["ses:SendEmail", "ses:SendRawEmail"]
    effect    = "Allow"
    resources = ["*"]
  }
}

resource "aws_iam_policy" "ses_send_email" {
  name   = "Codedang-Api-Ses-Send-Email"
  policy = data.aws_iam_policy_document.ses_send_email.json
}

resource "aws_iam_role_policy_attachment" "ecs_task_role" {
  role       = aws_iam_role.ecs_task_role.name
  policy_arn = aws_iam_policy.ses_send_email.arn
}
