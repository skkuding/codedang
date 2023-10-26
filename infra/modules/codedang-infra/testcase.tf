resource "aws_s3_bucket" "testcase" {
  bucket = "codedang-testcase"

  tags = {
    Name = "Codedang-Testcase"
  }
}

data "aws_iam_policy_document" "testcase_permissions" {
  statement {
    actions   = ["s3:ListBucket", "s3:GetObject"]
    resources = ["${aws_s3_bucket.testcase.arn}", "${aws_s3_bucket.testcase.arn}/*"]

    principals {
      type        = "*"
      identifiers = ["*"]
    }

    condition {
      test     = "IpAddress"
      variable = "AWS:SourceIp"
      values   = [aws_eip.nat_eip.public_ip]
    }
  }
}

resource "aws_s3_bucket_policy" "testcase" {
  bucket = aws_s3_bucket.testcase.id
  policy = data.aws_iam_policy_document.testcase_permissions.json
}

# user
# TODO: do not create IAM user, use EC2 instance profile instead
resource "aws_iam_user" "testcase" {
  name = "user-codedang-testcase"
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

# Iris ECS Task Execution Role
resource "aws_iam_role" "ecs_iris_task_execution_role" {
  name               = "Codedang-Iris-Task-Execution-Role"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_execution_role.json
}

resource "aws_iam_role_policy_attachment" "ecs_iris_task_execution_role" {
  role       = aws_iam_role.ecs_iris_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Iris ECS Task Role
resource "aws_iam_role" "ecs_iris_task_role" {
  name               = "Codedang-Iris-Task-Role"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_role.json
}

data "aws_iam_policy_document" "iris_testcase_access" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.testcase.arn}/*"]
  }
}

resource "aws_iam_policy" "iris_testcase_access" {
  name   = "Codedang-Iris-Testcase-Access"
  policy = data.aws_iam_policy_document.iris_testcase_access.json
}

resource "aws_iam_role_policy_attachment" "iris_testcase_access" {
  role       = aws_iam_role.ecs_iris_task_role.name
  policy_arn = aws_iam_policy.iris_testcase_access.arn
}
