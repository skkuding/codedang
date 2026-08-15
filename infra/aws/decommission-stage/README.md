# AWS Decommission Stage

This Terraform root isolates retired AWS failover resources from operational
infrastructure. Importing resources here does not authorize their deletion.

Every resource is protected by `prevent_destroy`, and imported resources ignore
configuration drift. Remove those guards only in a dedicated deletion change
after reviewing a complete `terraform plan -destroy`.

## Staged resources

- Legacy admin/client ALBs, target groups, listeners, subnets, and security groups
- Amazon MQ broker, attached configuration, subnet, and Secrets Manager secret
- ECS launch templates, IAM roles, policy attachments, and instance profiles
- Stopped NAT and bastion instances and the blackholed NAT route
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
5. Preserve the ACM validation CNAME managed by `infra/aws/dns`; the active
   wildcard certificate currently shares it.
6. Do not include RDS snapshots, active S3 buckets, the cross-account VPC
   peering connection, or resources managed by the website and cookbook
   repositories in a bulk destroy.
