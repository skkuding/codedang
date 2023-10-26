###################### ECS Cluster ######################
resource "aws_ecs_cluster" "api" {
  name = "Codedang-Api"
}

resource "aws_ecs_cluster" "iris" {
  name = "Codedang-Iris"
}

################# IAM Role - ecs container instance #################
resource "aws_iam_instance_profile" "ecs_container_instance_role" {
  name = "Codedang-ECS-Container-Instance-Profile"
  role = aws_iam_role.ecs_container_instance_role.name
}

resource "aws_iam_role" "ecs_container_instance_role" {
  name               = "Codedang-ECS-Container-Instance-Role"
  assume_role_policy = data.aws_iam_policy_document.ecs_container_instance_role.json
}
data "aws_iam_policy_document" "ecs_container_instance_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy_attachment" "ecs_container_instance_role" {
  role       = aws_iam_role.ecs_container_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

################# IAM Role - task execution #################
resource "aws_iam_instance_profile" "ecs_task_execution_role" {
  name = "Codedang-ECS-Task-Execution-Profile"
  role = aws_iam_role.ecs_task_execution_role.name
}

resource "aws_iam_role" "ecs_task_execution_role" {
  name               = "Codedang-Api-Task-Execution-Role"
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

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = aws_iam_policy.ecs_task_execution_role.arn
}

resource "aws_iam_policy" "ecs_task_execution_role" {
  name        = "AllowEcrPull"
  description = "Allows ECS tasks to pull images from ECR"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Effect   = "Allow",
        Resource = "*"
      }
    ]
  })
}

# IAM Policy to allow sending emails via SES
resource "aws_iam_role" "ecs_task_role" {
  name               = "Codedang-API-Task-Role"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_role.json
}

data "aws_iam_policy_document" "ecs_task_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy_attachment" "ecs_ses" {
  role       = aws_iam_role.ecs_task_role.name
  policy_arn = aws_iam_policy.ses_send_email.arn
}

resource "aws_iam_policy" "ses_send_email" {
  name   = "Codedang-Api-Ses-Send-Email"
  policy = data.aws_iam_policy_document.ses_send_email.json
}

data "aws_iam_policy_document" "ses_send_email" {
  statement {
    actions   = ["ses:SendEmail", "ses:SendRawEmail"]
    effect    = "Allow"
    resources = ["*"]
  }
}

################# cloudinit config #################
# data "cloudinit_config" "api_config" {
#   gzip          = false
#   base64_encode = true

#   part {
#     content_type = "text/x-shellscript"
#     content      = <<EOF
#     #!/bin/bash
#     echo ECS_CLUSTER="${aws_ecs_cluster.api.name}" >> /etc/ecs/ecs.config
#     ECS_ENABLE_TASK_IAM_ROLE=true
#     ECS_ENABLE_CONTAINER_METADATA=true
#     ECS_CONTAINER_INSTANCE_PROPAGATE_TAGS_FROM=ec2_instance
#     EOF
#   }
# }

# data "cloudinit_config" "iris_config" {
#   gzip          = false
#   base64_encode = true

#   part {
#     content_type = "text/x-shellscript"
#     content      = <<EOF
#     #!/bin/bash
#     echo ECS_CLUSTER="${aws_ecs_cluster.iris.name}" >> /etc/ecs/ecs.config
#     ECS_ENABLE_TASK_IAM_ROLE=true
#     ECS_ENABLE_CONTAINER_METADATA=true
#     ECS_CONTAINER_INSTANCE_PROPAGATE_TAGS_FROM=ec2_instance
#     EOF
#   }
# }
