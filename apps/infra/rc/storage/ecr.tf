data "aws_ecr_repository" "repositories" {
  for_each = toset(var.repository_names)
  name     = each.value
}

resource "aws_ecr_lifecycle_policy" "repository_policy" {
  for_each = data.aws_ecr_repository.repositories

  repository = each.value.name
  policy     = <<EOF
    {
        "rules": [
        {
            "rulePriority": 1,
            "description": "Keep the last 2 multi-architecture sets (1 image index, 2 architecture images).",
            "selection": {
            "tagStatus": "any",
            "countType": "imageCountMoreThan",
            "countNumber": 6
            },
            "action": {
            "type": "expire"
            }
        }
        ]
    }
    EOF
}
