# AWS Decommission Stage

This Terraform root isolates retired AWS failover resources from operational
infrastructure. Importing resources here does not authorize their deletion.

Every resource is protected by `prevent_destroy`, and imported resources ignore
configuration drift. Remove those guards only in a dedicated deletion change
after reviewing a complete `terraform plan -destroy`.

## State transfer

Resources formerly managed by `infra/aws/vpc` and `infra/aws/storage` are
detached there through `removed` blocks with `destroy = false`. Apply those
source-root plans first, verify that they contain no destroy actions, and then
apply this root to import the detached resources. The active DB resources in
the former mixed-purpose VPC modules use `moved` blocks and remain in the VPC
state.

Do not remove the source-root `removed` blocks until the migration has been
applied and this root produces a clean plan. The retired Redis cluster no longer
exists; only its residual subnet group is imported here.

Task definition import plans can render historical container environment values.
Keep their full output out of logs and remove saved plan files promptly.

## Staged resources

- Legacy admin/client ALBs, target groups, listeners, subnets, and security groups
- Amazon MQ broker, attached configuration, subnet, and Secrets Manager secret
- ECS launch templates, IAM roles, policy attachments, and instance profiles
- All active legacy ECS task definition revisions
- Empty legacy ECS CloudWatch log groups
- Stopped NAT and bastion instances
- Legacy API, admin, Iris, Redis, MQ, DB, Jaeger, and Grafana network resources
- Retired stage CloudFront distribution and its wildcard certificate
- Unused `codedang.com` apex ACM certificate

## Before deletion

1. Remove the live `iris-legacy` namespace. Its hourly ExternalSecret refresh is
   the remaining consumer of `Codedang-JudgeQueue-Secret`.
2. Delete the ALB listeners and load balancers before their security groups and
   public subnets.
3. Delete the MQ broker before its configuration, secret, and subnet.
4. Delete stopped instances before their subnets and security groups.
   The blackholed NAT route remains inline in the active private route table
   and must be removed from `infra/aws/vpc` separately.
5. Delete the legacy ECS log groups only after their task definitions are
   deregistered and no service can publish to them.
6. Preserve the ACM validation CNAME managed by `infra/aws/dns`; the active
   wildcard certificate currently shares it.
7. Do not include RDS snapshots, active S3 buckets, the cross-account VPC
   peering connection, or resources managed by the website and cookbook
   repositories in a bulk destroy.
