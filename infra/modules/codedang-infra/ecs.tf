resource "aws_ecs_cluster" "api" {
  name = "Codedang-Api"
}

data "aws_iam_policy_document" "ecs_task_execution_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs.amazonaws.com"]
    }
  }
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

resource "aws_iam_instance_profile" "codedang-ecs" {
  name = "ECS-codedang"
  role = aws_iam_role.ecs_task_execution_role.name
}

resource "aws_iam_role" "ecs_task_execution_role" {
  name               = "Codedang-Api-Task-Execution-Role-test"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_execution_role.json
}

resource "aws_ecs_capacity_provider" "ecs_capacity_provider" {
  name = "test-codedang-capacity-provider1"
  auto_scaling_group_provider {
    auto_scaling_group_arn         = aws_autoscaling_group.codedang-asg-admin.arn
    managed_termination_protection = "ENABLED"


    managed_scaling {
      maximum_scaling_step_size = 10
      minimum_scaling_step_size = 1
      status                    = "ENABLED"
      target_capacity           = 1

    }
  }
}

resource "aws_ecs_cluster_capacity_providers" "ecs" {
  cluster_name = aws_ecs_cluster.api.name

  capacity_providers = [aws_ecs_capacity_provider.ecs_capacity_provider.name]
}

resource "aws_iam_role_policy_attachment" "ecs_ses" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = aws_iam_policy.ses_send_email.arn
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

data "cloudinit_config" "config" {
  gzip          = false
  base64_encode = true

  part {
    content_type = "text/x-shellscript"
    content      = <<EOF
    #!/bin/bash
    echo ECS_CLUSTER="${aws_ecs_service.iris.name}" >> /etc/ecs/ecs.config
    ECS_ENABLE_TASK_IAM_ROLE=true
    echo ECS_ENABLE_CONTAINER_METADATA=true >> /etc/ecs/ecs.config
    echo ECS_CONTAINER_INSTANCE_PROPAGATE_TAGS_FROM=ec2_instance >> /etc/ecs/ecs.config
    EOF
  }
}
