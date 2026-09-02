## context

This directory preserves the final discoverable configuration of Codedang's retired
AWS ECS failover estate before a separately reviewed decommission. Most compute
moved from AWS to the on-premises Kubernetes clusters; only intentional services
such as RDS and S3 remain in AWS. The archived resources are remnants of the
AWS-to-on-premises migration and of an ECS failover project that was ultimately
scrapped, not a recovery environment.

The archive is historical, sanitized, incomplete, and deliberately
non-deployable. Its accepted scope and handling rules are documented in
[`README.md`](README.md)

## Findings

### ECS task definitions

AWS contains no ECS clusters, services, or running tasks for this estate. An ECS
task definition is a versioned recipe that can be used to launch containers;
`ACTIVE` means that a revision remains launchable, not that anything is running.

The live inventory contains exactly 297 revisions in nine families: 81 ACTIVE
and 216 INACTIVE. The AWS provider can import only ACTIVE revisions, so
[`infra/legacy/aws-failover/task-definitions.tf`](../../aws-failover/task-definitions.tf)
tracks the 81 ACTIVE ARNs in a disabled, dedicated state while the archive
preserves sanitized configuration for both statuses. The Terraform root is
therefore a retention guard and ARN inventory, not a complete historical
configuration source.

Git retains useful architectural intent, relationships, and portions of the old
Terraform, but it does not contain the unique final configuration of every live
revision. [`ecs-task-definitions/revisions.ndjson`](ecs-task-definitions/revisions.ndjson)
fills that gap. Its derived
[`change-index.json`](ecs-task-definitions/change-index.json) shows meaningful
revision changes rather than just revision numbers: container structure and
resources, environment-variable name sets, images, commands and entrypoints,
and transitions among logging arrangements such as CloudWatch and Fluent Bit.
The definitions remain stale control-plane records and still refer to historical
IAM roles, container images, and log groups even though no ECS compute exists.

### Related resources and dependencies

The supporting snapshots preserve unique live details for the retired
CloudFront distribution, two launch templates and all eight versions, nine
security groups, the Amazon MQ broker and attached configuration revision, and
both application load balancers (ALBs), including listeners, rules, attributes,
target groups, health checks, and final target health.

The bounded dependency checks found:

- Production `iris-legacy` is scaled to zero, but its `ExternalSecret` still
  reads `Codedang-JudgeQueue-Secret` hourly. Secret polling does not demonstrate
  broker traffic, but it is a live dependency that must be removed before the MQ
  secret is deleted.
- The retired security groups contain internal references and residual
  references involving the `jaeger-sg` and `grafana-agent` experiment groups.
  Security-group deletion must respect and first remove those references.
- The retained task definitions refer to stale IAM roles and CloudWatch log
  groups. Fresh checks must confirm that no other publisher or principal uses
  those resources before they are deleted.
- Both ALB target groups had no registered targets, ALB request metrics had no
  datapoints in the investigated window, and Amazon MQ metrics showed no
  connections, consumers, messages, or publish activity in the bounded checks.

These observations support later decommissioning but do not prove eternal
non-use. There is no durable CloudTrail, AWS Config, or VPC flow-log history for
all relevant behavior, so fresh checks are required immediately before deletion.

## Archive implementation

The archive contains the following exact categories:

- `ecs-task-definitions/revisions.ndjson`: 297 canonical, sanitized task
  definition records, ordered by family and numeric revision.
- `ecs-task-definitions/manifest.json`: extraction metadata, schema, redaction
  policy, and family/status counts.
- `ecs-task-definitions/change-index.json`: deterministic consecutive revision
  ranges for structural, environment-name, image, command/entrypoint, and
  logging changes.
- `live-snapshots/cloudfront-E3MGLL85LUMBTC.json`: the retired stage
  distribution.
- `live-snapshots/launch-templates/*.json`: two templates covering eight
  versions, with user data omitted without decoding.
- `live-snapshots/security-groups.json`: nine relevant groups and their rules.
- `live-snapshots/mq/*.json`: broker, attached configuration, and configuration
  revision.
- `live-snapshots/load-balancing/*.json`: two ALBs, listeners, rules,
  attributes, target groups, health-check configuration, tags, and final target
  health.
- `git-history/fluent-bit.conf`: the deleted Fluent Bit S3 asset recovered from
  the parent of commit `0aa282dba`; production and RC had the same final file.
- `tools/archive.py` and `verify.sh`: deterministic derivation, sanitization, and
  offline verification tooling.

Every ECS environment entry retains only its name; all environment values are
unconditionally omitted. Secret-reference metadata may remain, but referenced
secrets were never fetched. Credential-like strings, credential-bearing URI
userinfo, access keys, JWTs, private keys, suspicious opaque values, response
metadata, and uncertain command fields are omitted or rejected. Raw AWS
responses, Terraform state and plans, provider caches, launch-template user
data, and secret values were never written into the archive.

## Security assessment

Historical ECS task definitions embedded plaintext credentials in container
environment values. Raw values were never committed by this archive work, and
the archive omits every environment value rather than attempting selective
redaction. Nevertheless, those historical credentials must be treated as
potentially still valid and rotated independently of resource deletion. The
archive is not a credential backup and must not be used to reconstruct secrets.

## Validation evidence and limitations

Validation established exact parity between the 81 ACTIVE task-definition ARNs
in live discovery and the Terraform retention inventory, plus exact preservation
of all 297 unique live family/revision pairs. The counts are 81 ACTIVE and 216 INACTIVE
across the nine expected families, matching
[`manifest.json`](ecs-task-definitions/manifest.json).

`verify.sh` performs offline JSON/NDJSON parsing, ordering and uniqueness checks,
family/status count checks, environment-value rejection, archive-wide common
secret-pattern scans, and exact deterministic regeneration checks for the
manifest and change index. Independent secret-pattern scans found no archived
credential values. `gitleaks` was not available, so no claim is made that its
rule set was run.

The snapshots are point-in-time evidence, not deployable backups. They omit
sensitive and uncertain fields by design. Empty targets and bounded zero-valued
or absent metrics are strong retirement evidence, but cannot establish that a
resource was never used before or will never be referenced later.
