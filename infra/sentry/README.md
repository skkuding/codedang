# Sentry

This Terraform root manages the `skkuding` organization on sentry.io: teams,
projects, client keys (DSNs), alert rules, and uptime monitors.

The provider reads `SENTRY_AUTH_TOKEN` from the environment. Each operator
issues their own token from the `terraform` Internal Integration and keeps it in
`.envrc.local` (see the repository's `.envrc.local.example`). Tokens are never
shared; revoke an operator's token in Sentry when they leave.

The S3 backend also needs AWS credentials for the `codedang-tf-state` bucket.

## Managed outside Terraform

The Sentry API cannot create these, so they are set up by hand in the Sentry UI:

- The organization itself. Terraform only reads it with a data source so that
  no plan can delete the organization and its sponsored plan.
- Organization members and their roles. Integration tokens cannot manage
  members.
- The `terraform` Internal Integration and its tokens.
- Discord and GitHub integrations. Terraform can only look up installed ones.
- The CI auth token for source map uploads and the read-only token for the
  incident diagnosis agent.

## Outputs

`frontend_dsn` is the public DSN for the frontend SDK. It is embedded in the
browser bundle and is not a secret.
