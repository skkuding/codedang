data "aws_iam_policy_document" "ec2_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "ecs_task_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

# This role was used only by the retired EC2-backed ECS clusters.
resource "aws_iam_role" "ecs_container_instance" {
  name               = "Codedang-ECS-Container-Instance-Role"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume_role.json

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}

# This managed-policy attachment exists only for the retired ECS role.
resource "aws_iam_role_policy_attachment" "ecs_container_instance" {
  role       = aws_iam_role.ecs_container_instance.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"

  lifecycle {
    prevent_destroy = true
  }
}

# No running instance uses this legacy ECS instance profile.
resource "aws_iam_instance_profile" "ecs_container_instance" {
  name = "Codedang-ECS-Container-Instance-Profile"
  role = aws_iam_role.ecs_container_instance.name

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}

# Kubernetes replaced this ECS task execution role.
resource "aws_iam_role" "ecs_task_execution" {
  name               = "Codedang-Api-Task-Execution-Role"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_assume_role.json

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}

# This managed-policy attachment exists only for the retired task role.
resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"

  lifecycle {
    prevent_destroy = true
  }
}

# This legacy task profile has no remaining ECS consumer.
resource "aws_iam_instance_profile" "ecs_task_execution" {
  name = "Codedang-ECS-Task-Execution-Profile"
  role = aws_iam_role.ecs_task_execution.name

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}
