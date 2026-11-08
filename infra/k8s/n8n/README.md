# n8n

n8n runs in the production cluster and is managed by Argo CD through `../argocd/applications/n8n.yaml` (`n8n-production`, `release` branch, self-heal on, pruning off).

## Deployment

Argo CD renders the pinned Helm chart with `values.yaml` and applies this directory's Kustomization (SealedSecrets and the `n8n-provisioning` ConfigMap). Changes reach production when they land on the `release` branch; do not run `helm upgrade` or `kubectl apply` by hand.

The chart version is pinned to `1.23.0`. This version supports `extraManifests`, which is used to create the `HTTPRoute` on the shared `main-gateway`, and `main.extraEnvVars`, which carries the execution settings that n8n reads from its environment. The chart derives `N8N_EDITOR_BASE_URL` only from an enabled `Ingress`, so `main.editorBaseUrl` sets it explicitly.

### Verify

Render the manifests locally before changing them:

```sh
helm template n8n n8n --repo https://community-charts.github.io/helm-charts \
  --version 1.23.0 \
  --namespace n8n \
  --values values.yaml
kubectl kustomize .
```

After a release, check that `n8n-production` is `Synced` and `Healthy` in Argo CD and that the pod is ready:

```sh
kubectl get pods,httproute --namespace n8n
```

## Notion backup

`workflows/notion-backup.json` schedules `scripts/notion-backup.mjs` daily at 03:00 Asia/Seoul. `workflows/notion-activity.json` receives signed Notion deletion and restoration events and stores them on the n8n PVC. `workflows/notion-activity-backup.json` independently publishes that append-only event log to a dedicated Git repository every five minutes.

The webhook verification token persists on the n8n PVC at `/home/node/.n8n/notion-events/verification-token`. The provisioning init container sets it to mode `0400` on every start so another verification payload cannot replace the active signing key. To rotate it, remove the file while n8n is running, recreate and verify the Notion webhook subscription; the next start (or a manual `chmod`) restores mode `0400`.

The exporter:

- enumerates every page visible to the Notion integration;
- stays below the documented average of three Notion API requests per second;
- honors `Retry-After` and retries 429, 529, and transient idempotent failures;
- recursively converts page blocks to Markdown;
- streams Notion-hosted attachments through temporary files and uploads immutable S3 objects at `production/notion/objects/sha256/<first2>/<sha>`;
- publishes a canonical snapshot at `production/notion/snapshots/YYYY/MM/DD/<timestamp>.json` and records its key/digest in `.notion-backup-s3-manifest.json`;
- rewrites downloaded attachment links to `s3-backup://assets/<page-id>/<file>` and removes `assets/` from the Git branch tip;
- preserves pages that disappear from API search and records `missing_since` instead of deleting them; and
- commits and pushes once, after the complete export succeeds.

The document and activity publishers use separate filesystem locks. A manual execution that overlaps a scheduled execution is skipped instead of producing competing commits from the same remote parent.

The activity publisher clones both repositories at the start of every execution, resolves known entity titles from the latest document manifest, and calls the Notion Users API to resolve actor names. It writes daily Asia/Seoul JSONL files under `log/YYYY-MM/YYYY-MM-DD.jsonl` in the dedicated activity repository, with its own commit and push cycle. Existing daily files are retained, and late or retried events update their corresponding day. Provisioning activates the publisher after its repository-scoped SealedSecret is available.

Git stores the backup, so no PVC is required for exported documents. The n8n PVC only preserves users, credentials, workflows, execution metadata, the activity event log, and the webhook verification token. The production `local-path` StorageClass is node-local, so the Git repository remains the disaster-recovery copy.

## Credentials

Create a production-scoped SealedSecret that produces `Secret/n8n/notion-backup-credentials`. Never commit the unsealed Secret. The Secret volume is optional so ArgoCD can render before credentials are available.

Required document keys:

| Key | Purpose |
| --- | --- |
| `notion-token` | Dedicated read-only Notion integration token |
| `git-repository` | Clean HTTPS repository URL without embedded credentials |
| `git-token` | Fine-grained token limited to repository contents read/write |

S3 keys are mounted separately at `/run/secrets/notion-s3-backup`:

| Key | Purpose |
| --- | --- |
| `aws-access-key-id` | Dedicated writer access key |
| `aws-secret-access-key` | Dedicated writer secret |
| `aws-region` | S3 region |
| `s3-bucket` | Backup bucket |
| `s3-prefix` | Defaults to `production/notion` |
| `s3-kms-key-id` | Dedicated KMS key identifier |

`activity-backup-credentials.yaml` seals the separate `Secret/n8n/notion-activity-backup-credentials` for the private `tasoo-oos/codedang-notion-activity` repository. Do not reuse the document repository as its destination or place the plaintext token in Git.

Required activity keys:

| Key | Purpose |
| --- | --- |
| `git-repository` | Clean HTTPS URL for the dedicated activity-log repository |
| `git-token` | Fine-grained token limited to the activity repository contents |

Optional activity keys use the same defaults as the document backup: `git-branch`, `git-username`, `git-author-name`, and `git-author-email`. The document backup credentials remain mounted so the activity publisher can read the latest document manifest and resolve entity titles.

Optional keys:

| Key | Default |
| --- | --- |
| `git-branch` | `main` |
| `git-username` | `x-access-token` |
| `git-author-name` | `Codedang Notion Backup` |
| `git-author-email` | `notion-backup@codedang.com` |
| `max-file-bytes` | `1073741824` (1 GiB) |

The destination repository and branch must already exist. Share every intended top-level Notion page or teamspace with the integration; the API cannot back up private content it cannot see.

## Notion limits

Notion documents an average limit of three requests per second for each integration and an additional workspace-wide limit scaled by plan. It does not publish the numeric workspace limit for Plus or Plus with education billing. The exporter uses one serialized request queue at about 2.85 requests per second, requests the maximum 100 results per page, rejects incomplete search results, and follows `Retry-After` on throttling.

Notion-hosted file URLs expire after one hour. The exporter downloads each URL while processing its page rather than storing the temporary URL. A full export can run longer than the URL lifetime, so when a download fails with 403 or 404 the exporter re-reads the owning page or block for a fresh signed URL and retries once; it still fails the run if the refreshed download fails. Plus education is a paid plan for Notion file-size purposes, so the workspace may contain uploads much larger than a normal Git host accepts; see Git limitations below.

## Argo CD adoption

The release used to be installed by hand with Helm. Argo CD takes it over in place:

1. Before the first sync, export the live workflows and credentials and keep the encryption key. The data stays on the `n8n-data` claim that `main.persistence.existingClaim` selects; `n8n-main-persistence` is pinned to the decommissioned `skkuding-4f-4` node and is unused.
2. The first sync replaces the Ingress with the `HTTPRoute` and restarts n8n. The v7 marker is missing, so provisioning re-imports the managed credentials and workflows and overwrites UI edits to them.
3. Pruning is off, so delete the leftover `Ingress/n8n` and the old Helm release Secrets (`sh.helm.release.v1.n8n.*`) by hand once n8n is healthy.
4. Confirm owner login, the four workflows, and one backup run.

The chart references the existing `n8n-encryption-key-secret-v2` Secret, which is not in Git. Argo CD does not manage it; convert it to a production SealedSecret so a cluster rebuild does not depend on it.

The provisioning init container imports the encrypted integration credentials and the four managed workflows, then activates all four. It refuses to start n8n if provisioning fails, so preserve and verify the existing owner and encryption key before rollout.

## Git limitations

Files larger than 1 GiB fail the run by default rather than silently producing an incomplete backup. The configured limit is enforced while streaming and declared HTTP lengths must match received bytes. The exporter uses the stock `n8nio/n8n:1.123.87` image and its bundled `@aws-sdk/client-s3@3.808.0`; objects use manually managed streamed multipart uploads, so raise the limit deliberately for larger Notion files. GitHub stores Markdown and recovery metadata only.

Both backup branches must accept direct fast-forward pushes from their respective backup identities. Use dedicated repositories or unprotected backup branches rather than branches that require pull requests.

External file URLs are retained as links instead of downloaded because they can point to arbitrary hosts. Notion-hosted temporary URLs are downloaded during the run. Restore with `node /opt/n8n-provisioning/notion-restore.mjs <snapshot-key> <output-directory>`; it rejects traversal and verifies every recovered file's size and SHA-256 before writing it.

The init container runs `notion-s3-preflight.mjs` before importing workflows. It requires the stock n8n installation's `/usr/local/lib/node_modules/n8n/package.json`, verifies the bundled client version is exactly `3.808.0`, and checks all multipart commands. Any n8n upgrade must repeat this validation before rollout.

`notion-backup-s3-credentials.yaml` is listed in `kustomization.yml` and carries the sealed S3 credentials, so Argo CD creates the SealedSecret and the controller decrypts it into the Secret. Rotate them by resealing the values, not by applying a plaintext Secret.

## Updating the workflow

The import init container uses `/home/node/.n8n/.managed-workflows-v7` as a migration marker. When changing the managed workflows or credentials, increment the marker suffix in `values.yaml`. The GitHub-to-Notion workflow, webhook activity logger, activity Git publisher, and document backup are activated during provisioning.

## TODO

- [ ] Replace SQLite with PostgreSQL for production use
- [ ] Replace binary data storage with S3 or MinIO for production use
