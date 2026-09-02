# Retired AWS failover archive

> [!WARNING]
> These artifacts are historical, sanitized, incomplete, and non-deployable.
> They must not be used as Terraform input or as a recovery source for secrets.

This directory records the final discoverable configuration of the retired AWS
failover/ECS estate that is isolated for removal by
[`infra/aws/decommission-stage`](../../../aws/decommission-stage/README.md).
The archive was extracted on 2026-08-27 from AWS account `219857217698` using
read-only AWS CLI calls through `ssh sv3`. Regional resources were queried in
`ap-northeast-2`; CloudFront is global (with its related ACM control plane in
`us-east-1`, although certificate snapshots are not part of this archive).

## Contents and provenance

- `ecs-task-definitions/revisions.ndjson` is a live-only snapshot of all 297
  task definition revisions discoverable as ACTIVE or INACTIVE at extraction.
  The disabled legacy Terraform root preserves only the 81 ACTIVE revision ARNs
  and does not preserve their configurations.
- `ecs-task-definitions/manifest.json` gives counts by family/status and the
  archive schema/redaction policy.
- `ecs-task-definitions/change-index.json` groups consecutive revisions by
  structural configuration, environment-name sets, image sets,
  commands/entrypoints, and logging configuration.
- `live-snapshots/` contains unique live-only sanitized snapshots for the
  requested CloudFront distribution, both launch templates and all eight of
  their versions, nine security groups, the MQ broker/configuration revision,
  and both ALBs with listeners, rules, attributes, target groups, health-check
  settings, and final target health.
- `git-history/fluent-bit.conf` is already recoverable from Git rather than
  live AWS. It is the identical final production/RC configuration from the
  parent of commit `0aa282dba`, originally introduced around commit
  `5cbc27ad8`. The deleted `codedang-internal` bucket's Fluent Bit configuration
  therefore remains recoverable from repository history.

The Terraform under `infra/legacy/` and `infra/aws/decommission-stage/` remains
the source for historical intent, resource relationships, and import IDs. The
live snapshots here capture details not represented by those guarded Terraform
placeholders.

## Redaction and omissions

- Every ECS environment entry retains only `name`; its value is unconditionally
  absent.
- ECS secret and repository-credential references retain names and non-value
  reference metadata. No referenced SSM, Secrets Manager, or repository secret
  was queried.
- Credential-bearing URI userinfo, access keys, JWTs, private keys,
  credential-like assignments, and suspicious opaque strings are rejected or
  replaced with an omission marker. No hashes of removed values are stored.
- Commands, entrypoints, health commands, log options, and tags are retained
  only after recursive scanning. An uncertain field is omitted rather than
  risked.
- Launch-template user data was not decoded or inspected. It is omitted from
  all eight versions because bootstrap data can contain credentials.
- AWS CLI response metadata and pagination tokens are omitted. Useful resource
  creation and ECS registration timestamps are retained.
- Secrets Manager values, Terraform state/plans, provider caches, and raw AWS
  responses were never written to this directory.

## Offline verification

Run from any directory; live AWS access is not required:

```bash
infra/legacy/archive/aws-failover/verify.sh
```

The verifier parses every JSON/NDJSON artifact, requires 297 unique ECS
family/revision pairs in family/numeric-revision order, checks the expected nine
families, rejects environment values, and scans all archive text for common
credential, private-key, token, URI-userinfo, and secret-assignment patterns.
