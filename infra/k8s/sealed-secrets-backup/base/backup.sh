#!/bin/sh

# -e: exit on error
# -u: error on undefined vars
# -o pipefail: fail on any pipe error
set -euo pipefail


# Step 1: Fetch all sealed-secrets encryption keys from the cluster
echo "Exporting sealed-secrets keys from kube-system..."
KEYS=$(kubectl get secrets -n kube-system \
  -l sealedsecrets.bitnami.com/sealed-secrets-key \
  -o json)

KEY_COUNT=$(echo "$KEYS" | jq '.items | length')
echo "Found $KEY_COUNT keys"

if [ "$KEY_COUNT" -eq 0 ]; then
  echo "ERROR: No sealed-secrets keys found"
  exit 1
fi

# Step 2: Upload the keys to AWS Secrets Manager
echo "Uploading to AWS Secrets Manager: $SECRET_NAME..."
echo "$KEYS" | aws secretsmanager put-secret-value \
  --region ap-northeast-2 \
  --secret-id "$SECRET_NAME" \
  --secret-string file:///dev/stdin

# Step 3: Verify the backup by comparing key counts
echo "Verifying backup integrity..."
REMOTE_COUNT=$(aws secretsmanager get-secret-value \
  --region ap-northeast-2 \
  --secret-id "$SECRET_NAME" \
  --query SecretString --output text | jq '.items | length')

if [ "$KEY_COUNT" != "$REMOTE_COUNT" ]; then
  echo "ERROR: Integrity check failed (local=$KEY_COUNT, remote=$REMOTE_COUNT)"
  exit 1
fi

echo "Backup complete: $REMOTE_COUNT keys saved to $SECRET_NAME"
