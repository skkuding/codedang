resource "aws_s3_bucket" "testcase" {
  bucket = "codedang-testcase-test"

  tags = {
    Name = "Codedang-Testcase-test"
  }
}

# user
resource "aws_iam_user" "testcase" {
  name = "user-codedang-testcase-test"
}

data "aws_iam_policy_document" "testcase_s3" {
  statement {
    actions   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
    resources = ["${aws_s3_bucket.testcase.arn}/*"]
  }
}

resource "aws_iam_user_policy" "testcase_s3" {
  name   = "codedang-testcase-s3"
  user   = aws_iam_user.testcase.name
  policy = data.aws_iam_policy_document.testcase_s3.json
}

resource "aws_iam_access_key" "testcase" {
  user = aws_iam_user.testcase.name
}

# role
resource "aws_iam_role" "ecs_iris_task_execution_role" {
  name               = "Codedang-Iris-Task-Execution-Role-test"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_execution_role.json
}

resource "aws_iam_role_policy_attachment" "ecs_iris_task_execution_role" {
  role       = aws_iam_role.ecs_iris_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

data "aws_iam_policy_document" "iris_testcase_access" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.testcase.arn}/*"]
  }
}

resource "aws_iam_policy" "iris_testcase_access" {
  name   = "IrisAccessTestcasebucketPolicy-test"
  policy = data.aws_iam_policy_document.iris_testcase_access.json
}

resource "aws_iam_role_policy_attachment" "iris_testcase_access" {
  role       = aws_iam_role.ecs_iris_task_execution_role.name
  policy_arn = aws_iam_policy.iris_testcase_access.arn
}
