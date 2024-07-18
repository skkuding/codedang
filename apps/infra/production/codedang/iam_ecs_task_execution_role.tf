data "aws_iam_policy_document" "task_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ecs_task_execution_role" {
  name               = "Codedang-Api-Task-Execution-Role"
  assume_role_policy = data.aws_iam_policy_document.task_assume_role.json

  tags = {
    Description = "ECS agent가 작업을 실행하고 관리할 때 사용하는 권한"
  }
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_instance_profile" "ecs_task_execution_profile" {
  name = "Codedang-ECS-Task-Execution-Profile"
  role = aws_iam_role.ecs_task_execution_role.name
}
