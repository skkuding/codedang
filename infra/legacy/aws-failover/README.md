# Legacy ECS task definitions

This disabled Terraform root preserves the 81 ACTIVE ECS task definition
revisions in the dedicated `terraform/legacy-ecs-task-definitions.tfstate` S3
state. Task definitions have no storage cost, and no ECS cluster, service, or
task remains for this estate.

The impossible Terraform version constraint in `disabled.tf` prevents normal
Terraform operations. The resource placeholders are import scaffolding only;
`ignore_changes = all` prevents Terraform from replacing the live definitions
with those placeholders, and `prevent_destroy = true` prevents deregistration.


