# n8n

n8n currently runs as a private, locally managed Helm release in the production cluster. `../argocd/applications/n8n.yaml` defines future ArgoCD tracking with self-heal enabled and pruning disabled, but intentionally points to the unpushed local branch. Move it to a private Git remote before applying it. Preserve the existing SQLite database and user state when adopting the release.

## Deployment

n8n is currently installed manually with Helm and is not managed by Argo CD. Changes to `values.yaml` are not applied automatically, so run the Helm upgrade command after changing the configuration.

The chart version is pinned to `1.23.0`. This version supports both `extraManifests`, which is used to create the `HTTPRoute`, and `main.extraEnv`, which is used to load credentials from Secrets.

### Install or upgrade

Run the following commands from this directory:

1. Add and update the Community Charts repository:

```sh
helm repo add community-charts https://community-charts.github.io/helm-charts
helm repo update
```

2. Create the namespace and apply the SealedSecrets and workflow ConfigMap:

```sh
kubectl create namespace n8n --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -k .
```

3. Install or upgrade n8n with the pinned chart version:

```sh
helm upgrade --install n8n community-charts/n8n \
  --version 1.23.0 \
  --namespace n8n \
  --values values.yaml \
  --wait
```

### Verify

Check the installed chart version and resources:

```sh
helm list --namespace n8n
kubectl get pods,httproute --namespace n8n
```

Render the manifests locally before applying a change:

```sh
helm template n8n community-charts/n8n \
  --version 1.23.0 \
  --namespace n8n \
  --values values.yaml
```

## Notion backup

`workflows/notion-backup.json` schedules `scripts/notion-backup.mjs` daily at 03:00 Asia/Seoul. `workflows/notion-activity.json` receives signed Notion deletion and restoration events and stores them on the n8n PVC. `workflows/notion-activity-backup.json` independently publishes that append-only event log to a dedicated Git repository every five minutes.

The persisted webhook verification token is made read-only before n8n starts so another verification payload cannot replace the active signing key. To rotate it, remove the file while n8n is running, recreate and verify the Notion webhook subscription, then set `/home/node/.n8n/notion-events/verification-token` to mode `0400` again.

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

Git stores the backup, so no PVC is required for exported documents. The n8n PVC only preserves users, credentials, workflows, and execution metadata. The production `local-path` StorageClass is node-local, so the Git repository remains the disaster-recovery copy.

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

## Initial adoption

Before the first ArgoCD sync:

1. Export the live n8n workflows and credentials and preserve the current encryption key.
2. Copy the live SQLite database and n8n user state into `n8n-main-persistence`.
3. Inspect the ArgoCD diff for replacement or deletion of the existing Helm resources.
4. Sync manually with pruning disabled.
5. Confirm authenticated owner access and all existing workflows before exposing or activating the backup workflow.
6. Run the backup against a small test page and test branch.
7. Activate `Notion Markdown Backup`, run a full backup, and inspect the resulting commit.

The chart currently references the existing `n8n-encryption-key-secret-v2` Secret to avoid encryption-key drift during adoption. Convert it to a production SealedSecret after migration so a cluster rebuild does not depend on an uncommitted generated Secret.

Do not apply the local ArgoCD Application until `n8n-encryption-key-secret-v2` is represented by a verified SealedSecret in the private Git source. ArgoCD can track the current cluster while that Secret exists, but it cannot rebuild n8n without it.

The provisioning init container imports the encrypted integration credentials, restores the GitHub-to-Notion workflow as active, and imports the Notion backup workflow as inactive. It refuses to start n8n if provisioning fails, so preserve and verify the existing owner and encryption key before rollout.

## Git limitations

Files larger than 1 GiB fail the run by default rather than silently producing an incomplete backup. The configured limit is enforced while streaming and declared HTTP lengths must match received bytes. The exporter uses the stock `n8nio/n8n:1.120.4` image and its bundled `@aws-sdk/client-s3@3.808.0`; objects use manually managed streamed multipart uploads, so raise the limit deliberately for larger Notion files. GitHub stores Markdown and recovery metadata only.

Both backup branches must accept direct fast-forward pushes from their respective backup identities. Use dedicated repositories or unprotected backup branches rather than branches that require pull requests.

External file URLs are retained as links instead of downloaded because they can point to arbitrary hosts. Notion-hosted temporary URLs are downloaded during the run. Restore with `node /opt/n8n-provisioning/notion-restore.mjs <snapshot-key> <output-directory>`; it rejects traversal and verifies every recovered file's size and SHA-256 before writing it.

The init container runs `notion-s3-preflight.mjs` before importing workflows. It requires the stock n8n installation's `/usr/local/lib/node_modules/n8n/package.json`, verifies the bundled client version is exactly `3.808.0`, and checks all multipart commands. Any n8n upgrade must repeat this validation before rollout. The backup workflow remains inactive during this staging step.

The S3 SealedSecret placeholder is not listed in `kustomization.yml`, so it cannot create an empty live Secret. Seal the approved workload credentials separately before adding that manifest to the rendered resources.

## Updating the workflow

The import init container uses `/home/node/.n8n/.managed-workflows-v7` as a migration marker. When changing the managed workflows or credentials, increment the marker suffix in `values.yaml`. The GitHub-to-Notion workflow, webhook activity logger, activity Git publisher, and document backup are activated during provisioning.

## TODO

- [ ] Replace SQLite with PostgreSQL for production use
- [ ] Replace binary data storage with S3 or MinIO for production use
