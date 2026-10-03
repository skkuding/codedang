# Notion backup AWS resources

This Terraform root manages the private S3, KMS, and workload identities used by
the production Notion document backup. It is guarded to AWS account
`219857217698` and region `ap-northeast-2`.

The first apply uses the explicitly approved bootstrap user
`tasoo-skkuding-claude` to create `notion-backup-provisioner`. Use that role for
all subsequent plans and applies. Terraform also grants the bootstrap user only
the permission needed to assume this role.

Never write state, plans, access keys, or unsealed Kubernetes Secrets into the
worktree. The writer secret is stored in Terraform state even though its output
is marked sensitive.

The initial plan must contain creates only. After apply, verify public access,
ownership controls, versioning, KMS encryption and rotation, TLS enforcement,
the multipart lifecycle rule, and denied delete/administration permissions.

Pipe the two sensitive credential outputs directly into `kubectl create secret
--dry-run=client` and `kubeseal` without printing them. Include the nonsensitive
region, bucket, prefix, and KMS key ARN. Delete temporary plaintext files and
verify no credentials entered the worktree before applying the SealedSecret.

The writer may abort failed multipart uploads but cannot delete completed object
versions. Retention, garbage collection, replication, Object Lock, and restore
identity creation are intentionally outside this root.
