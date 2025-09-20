data "aws_iam_policy_document" "ec2_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ecs_container_instance_role" {
  name               = "Codedang-ECS-Container-Instance-Role"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume_role.json

  tags = {
    Description = "ECS가 EC2 인스턴스를 등록할 수 있는 권한"
  }
}

resource "aws_iam_role_policy_attachment" "ecs_container_instance_role" {
  role       = aws_iam_role.ecs_container_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

resource "aws_iam_instance_profile" "ecs_container_instance_profile" {
  name = "Codedang-ECS-Container-Instance-Profile"
  role = aws_iam_role.ecs_container_instance_role.name
}
