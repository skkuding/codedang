resource "aws_ecs_cluster" "api" {
  name = "Codedang-Api"
}

resource "aws_ecs_cluster" "iris" {
  name = "Codedang-Iris"
}

resource "aws_iam_instance_profile" "codedang-ecs" {
  name = "ECS-codedang"
  role = aws_iam_role.ecs_task_execution_role.name
}

resource "aws_iam_role" "ecs_task_execution_role" {
  name               = "Codedang-Api-Task-Execution-Role-test"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_execution_role.json
}

data "aws_iam_policy_document" "ecs_task_execution_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy_attachment" "ecs_ses" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = aws_iam_policy.ses_send_email.arn
}

# IAM Policy to allow sending emails via SES
resource "aws_iam_policy" "ses_send_email" {
  name        = "AllowSESSendEmail"
  description = "Allows sending emails via SES"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail"
        ],
        Effect   = "Allow",
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

data "template_cloudinit_config" "api_config" {
  gzip          = false
  base64_encode = true

  part {
    content_type = "text/x-shellscript"
    content      = <<EOF
    #!/bin/bash
    echo ECS_CLUSTER="${aws_ecs_cluster.api.name}" >> /etc/ecs/ecs.config
    ECS_ENABLE_TASK_IAM_ROLE=true
    ECS_ENABLE_CONTAINER_METADATA=true
    ECS_CONTAINER_INSTANCE_PROPAGATE_TAGS_FROM=ec2_instance
    EOF
  }
}

data "template_cloudinit_config" "iris_config" {
  gzip          = false
  base64_encode = true

  part {
    content_type = "text/x-shellscript"
    content      = <<EOF
    #!/bin/bash
    echo ECS_CLUSTER="${aws_ecs_cluster.iris.name}" >> /etc/ecs/ecs.config
    ECS_ENABLE_TASK_IAM_ROLE=true
    ECS_ENABLE_CONTAINER_METADATA=true
    ECS_CONTAINER_INSTANCE_PROPAGATE_TAGS_FROM=ec2_instance
    EOF
  }
}
