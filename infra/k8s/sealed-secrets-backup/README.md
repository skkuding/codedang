# Sealed Secrets Key Restore Procedure

## When to Restore

- After a cluster rebuild or migration
- If the sealed-secrets controller loses its keys
- When setting up a new cluster that needs to decrypt existing SealedSecrets

## Prerequisites

- AWS CLI configured with access to Secrets Manager
- `kubectl` configured with the target cluster context
- IAM permissions: `secretsmanager:GetSecretValue` on `Codedang-Sealed-Secrets-*`

## Restore Steps

### 1. Download keys from AWS Secrets Manager

```bash
# Codedang-Sealed-Secrets-Prod or Codedang-Sealed-Secrets-Stage
SECRET_NAME=Codedang-Sealed-Secrets-Prod
aws secretsmanager get-secret-value \
  --secret-id "$SECRET_NAME" \
  --query SecretString --output text > sealed-secrets-keys.json
```

### 2. Verify the downloaded keys

```bash
jq '.items | length' sealed-secrets-keys.json
# Expected: prod=8, stage=6 (as of Jan 2026)
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
  sealed-secrets-controller -n kube-system
```

### 5. Verify decryption works

```bash
kubeseal --fetch-cert \
  --controller-name=sealed-secrets-controller \
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
