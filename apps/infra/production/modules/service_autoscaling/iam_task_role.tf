data "aws_iam_policy_document" "task_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "task_role" {
  count = var.task_role != null ? 1 : 0

  name               = var.task_role.iam_role.name
  description        = var.task_role.iam_role.description
  assume_role_policy = data.aws_iam_policy_document.task_assume_role.json
}

resource "aws_iam_policy" "task_role" {
  count = var.task_role != null ? 1 : 0

  name   = var.task_role.iam_policy.name
  policy = var.task_role.iam_policy.policy
}

resource "aws_iam_role_policy_attachment" "task_role" {
  count = var.task_role != null ? 1 : 0

  role       = aws_iam_role.task_role[0].name
  policy_arn = aws_iam_policy.task_role[0].arn
}
