# Legacy ECS task definitions

This disabled Terraform root preserves the 81 ACTIVE ECS task definition
revisions in the dedicated `terraform/legacy-ecs-task-definitions.tfstate` S3
state. Task definitions have no storage cost, and no ECS cluster, service, or
task remains for this estate.

The impossible Terraform version constraint in `disabled.tf` prevents normal
Terraform operations. The resource placeholders are import scaffolding only;
`ignore_changes = all` prevents Terraform from replacing the live definitions
with those placeholders, and `prevent_destroy = true` prevents deregistration.

The sanitized snapshots under [`../archive/aws-failover`](../archive/aws-failover/README.md)
remain the historical review copy. They are incomplete and non-deployable.

## State migration

State migration is an explicit infrastructure operation and is not performed by
this repository change. In a separately approved operation:

1. Temporarily remove the version constraint in `disabled.tf`.
2. Apply `infra/aws/decommission-stage` so its `removed` block detaches the task
   definitions from `terraform/decommission-stage.tfstate` without deregistering
   them.
3. Initialize this root and review a plan that imports exactly the 81 listed
   ARNs into `terraform/legacy-ecs-task-definitions.tfstate`. Import plans can
   expose historical environment values, so keep full output out of logs and
   delete saved plans promptly.
4. Apply only the reviewed imports, confirm both states, and restore
   `disabled.tf` before committing the final configuration.
