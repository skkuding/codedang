# Sealed Secrets Key Restore Procedure

## When to Restore

- After a cluster rebuild or migration
- If the sealed-secrets controller loses its keys
- When setting up a new cluster that needs to decrypt existing SealedSecrets

## Prerequisites

- AWS CLI configured with access to the backup S3 bucket
- `kubectl` configured with the target cluster context
- IAM permissions: `s3:GetObject`, `s3:ListBucket` on `arn:aws:s3:::codedang-sealed-secrets-backup`

## Backup Layout

```text
s3://codedang-sealed-secrets-backup/
├── production/
│   ├── latest.json                              # always overwritten; versioning keeps history (1 year)
│   └── snapshots/
│       └── 2026-04-27T03-00-00Z.json            # immutable point-in-time copy (3 years)
└── stage/
    ├── latest.json
    └── snapshots/
        └── ...
```

## Restore Steps

### 1. Download keys from S3

```bash
# production or stage
ENV=production

# Latest (most common case)
aws s3 cp "s3://codedang-sealed-secrets-backup/${ENV}/latest.json" \
  sealed-secrets-keys.json --region ap-northeast-2

# Or a specific point-in-time snapshot
aws s3 ls "s3://codedang-sealed-secrets-backup/${ENV}/snapshots/" --region ap-northeast-2
aws s3 cp "s3://codedang-sealed-secrets-backup/${ENV}/snapshots/<timestamp>.json" \
  sealed-secrets-keys.json --region ap-northeast-2

# Or a previous version of latest.json (S3 versioning)
aws s3api list-object-versions \
  --bucket codedang-sealed-secrets-backup \
  --prefix "${ENV}/latest.json" --region ap-northeast-2
aws s3api get-object \
  --bucket codedang-sealed-secrets-backup \
  --key "${ENV}/latest.json" \
  --version-id <VERSION_ID> \
  sealed-secrets-keys.json --region ap-northeast-2
```

### 2. Verify the downloaded keys

```bash
jq '.items | length' sealed-secrets-keys.json
# Expected: matches the number of keys present at the time the snapshot was taken
```

### 3. Apply keys to the cluster

```bash
jq -c '.items[]' sealed-secrets-keys.json | while read -r key; do
  echo "$key" | kubectl --context "${CLUSTER}" apply -f -
done
```

### 4. Restart the sealed-secrets controller

```bash
kubectl --context "${CLUSTER}" rollout restart deployment \
  sealed-secrets -n kube-system
```

### 5. Verify decryption works

```bash
kubeseal --fetch-cert \
  --controller-name=sealed-secrets \
  --controller-namespace=kube-system
```

If this returns a certificate without errors, the controller has access to its keys.

## Cleanup

```bash
rm sealed-secrets-keys.json
```

## Notes

- Key label: `sealedsecrets.bitnami.com/sealed-secrets-key`
- Key type: `kubernetes.io/tls` (contains `tls.crt` + `tls.key`)
- The controller iterates all keys during decryption, so all past keys must be preserved
- Backup CronJob runs on the 1st of each month at 03:00 UTC
- Bucket retention: snapshots 3 years, latest noncurrent versions 1 year (see `infra/aws/sealed-secrets-backup/s3.tf`)
