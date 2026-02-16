#!/bin/bash
set -euo pipefail

#############################################
# Codedang Cluster Bootstrap Script
#
# This script sets up a complete Kubernetes cluster from scratch:
# 1. Checks/installs required tools (via install-tools.sh)
# 2. Installs sealed-secrets controller
# 3. Restores sealed-secrets encryption keys from AWS Secrets Manager
# 4. Installs ArgoCD
# 5. Configures ArgoCD to self-manage and deploy all infrastructure
#
# Prerequisites:
# - Kubernetes cluster running and accessible
# - AWS credentials configured (for Secrets Manager access)
#
# To install tools manually: ./install-tools.sh
# To skip auto-install: AUTO_INSTALL_TOOLS=false ./bootstrap-cluster.sh
#############################################

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
CLUSTER_CONTEXT="${CLUSTER_CONTEXT:-}"
ENVIRONMENT="${ENVIRONMENT:-production}"  # production or stage
SEALED_SECRETS_SECRET_NAME="Codedang-Sealed-Secrets-${ENVIRONMENT^}"  # Capitalize first letter
AUTO_INSTALL_TOOLS="${AUTO_INSTALL_TOOLS:-true}"  # Set to false to skip auto-installation

echo "========================================="
echo "Codedang Cluster Bootstrap"
echo "========================================="
echo "Environment: ${ENVIRONMENT}"
echo "Sealed Secrets Secret: ${SEALED_SECRETS_SECRET_NAME}"
if [ -n "${CLUSTER_CONTEXT}" ]; then
  echo "Cluster Context: ${CLUSTER_CONTEXT}"
fi
echo "========================================="
echo

# Prepare kubectl command with optional context
KUBECTL="kubectl"
if [ -n "${CLUSTER_CONTEXT}" ]; then
  KUBECTL="kubectl --context ${CLUSTER_CONTEXT}"
fi

# Check prerequisites
echo "Checking prerequisites..."
MISSING_TOOLS=()
command -v kubectl >/dev/null 2>&1 || MISSING_TOOLS+=("kubectl")
command -v helm >/dev/null 2>&1 || MISSING_TOOLS+=("helm")
command -v aws >/dev/null 2>&1 || MISSING_TOOLS+=("aws")
command -v kubeseal >/dev/null 2>&1 || MISSING_TOOLS+=("kubeseal")
command -v jq >/dev/null 2>&1 || MISSING_TOOLS+=("jq")

if [ ${#MISSING_TOOLS[@]} -gt 0 ]; then
  echo -e "${YELLOW}⚠ Missing tools: ${MISSING_TOOLS[*]}${NC}"

  if [ "$AUTO_INSTALL_TOOLS" = "true" ]; then
    # Get current directory (where script is located)
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

    echo "Running install-tools.sh..."
    "${SCRIPT_DIR}/install-tools.sh" || {
      echo -e "${RED}✗ Failed to install tools${NC}"
      exit 1
    }

    # Verify installation
    for tool in "${MISSING_TOOLS[@]}"; do
      if ! command -v "$tool" >/dev/null 2>&1; then
        echo -e "${RED}✗ Failed to install $tool${NC}"
        exit 1
      fi
    done
  else
    echo -e "${RED}✗ Please install missing tools manually or set AUTO_INSTALL_TOOLS=true${NC}"
    echo "To install tools automatically, run: ./install-tools.sh"
    exit 1
  fi
fi

echo -e "${GREEN}✓ All prerequisites met${NC}"
echo

# Verify cluster access
echo "Verifying cluster access..."
$KUBECTL cluster-info >/dev/null 2>&1 || { echo -e "${RED}✗ Cannot access cluster${NC}"; exit 1; }
echo -e "${GREEN}✓ Cluster access verified${NC}"
echo

#############################################
# Step 1: Install Sealed Secrets Controller
#############################################
echo "========================================="
echo "Step 1: Installing Sealed Secrets"
echo "========================================="

# Add Helm repository
echo "Adding sealed-secrets Helm repository..."
helm repo add sealed-secrets https://bitnami-labs.github.io/sealed-secrets
helm repo update
echo -e "${GREEN}✓ Helm repository added${NC}"

# Install sealed-secrets controller
echo "Installing sealed-secrets controller..."
helm upgrade --install sealed-secrets sealed-secrets/sealed-secrets \
  --namespace kube-system \
  --wait \
  --timeout 5m
echo -e "${GREEN}✓ Sealed-secrets controller installed${NC}"
echo

#############################################
# Step 2: Restore Sealed Secrets Keys
#############################################
echo "========================================="
echo "Step 2: Restoring Sealed Secrets Keys"
echo "========================================="

# Create temporary directory for keys
TEMP_DIR=$(mktemp -d)
trap "rm -rf ${TEMP_DIR}" EXIT

echo "Downloading keys from AWS Secrets Manager..."
aws secretsmanager get-secret-value \
  --secret-id "${SEALED_SECRETS_SECRET_NAME}" \
  --query SecretString --output text > "${TEMP_DIR}/sealed-secrets-keys.json"

# Verify downloaded keys
KEY_COUNT=$(jq '.items | length' "${TEMP_DIR}/sealed-secrets-keys.json")
echo -e "${GREEN}✓ Downloaded ${KEY_COUNT} encryption keys${NC}"

# Apply keys to cluster
echo "Applying encryption keys to cluster..."
jq -c '.items[]' "${TEMP_DIR}/sealed-secrets-keys.json" | while read -r key; do
  echo "$key" | $KUBECTL apply -f -
done
echo -e "${GREEN}✓ Encryption keys restored${NC}"

# Restart sealed-secrets controller to load new keys
echo "Restarting sealed-secrets controller..."
$KUBECTL rollout restart deployment sealed-secrets-controller -n kube-system
$KUBECTL rollout status deployment sealed-secrets-controller -n kube-system --timeout=2m
echo -e "${GREEN}✓ Sealed-secrets controller restarted${NC}"

# Verify sealed-secrets is working
echo "Verifying sealed-secrets functionality..."
kubeseal --fetch-cert \
  --controller-name=sealed-secrets-controller \
  --controller-namespace=kube-system \
  $([ -n "${CLUSTER_CONTEXT}" ] && echo "--kubeconfig ${HOME}/.kube/config --context ${CLUSTER_CONTEXT}") \
  >/dev/null 2>&1 || { echo -e "${RED}✗ Failed to fetch certificate${NC}"; exit 1; }
echo -e "${GREEN}✓ Sealed-secrets is working correctly${NC}"
echo

#############################################
# Step 3: Install ArgoCD
#############################################
echo "========================================="
echo "Step 3: Installing ArgoCD"
echo "========================================="

# Create argocd namespace
echo "Creating argocd namespace..."
$KUBECTL create namespace argocd --dry-run=client -o yaml | $KUBECTL apply -f -
echo -e "${GREEN}✓ Namespace created${NC}"

# Get current directory (where script is located)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Apply ArgoCD self-management Application
echo "Applying ArgoCD self-management Application..."
$KUBECTL apply -f "${SCRIPT_DIR}/k8s/argocd/applications/argocd.yaml"
echo -e "${GREEN}✓ ArgoCD Application created${NC}"

# Wait for ArgoCD to be ready
echo "Waiting for ArgoCD to be ready..."
echo "(This may take several minutes as ArgoCD syncs all infrastructure components)"

# Wait for ArgoCD server deployment
$KUBECTL wait --for=condition=available --timeout=10m \
  deployment/argocd-server -n argocd 2>/dev/null || {
  echo -e "${YELLOW}⚠ ArgoCD server is still syncing, continuing...${NC}"
}

# Wait for ArgoCD application controller
$KUBECTL wait --for=condition=available --timeout=10m \
  deployment/argocd-application-controller -n argocd 2>/dev/null || {
  echo -e "${YELLOW}⚠ ArgoCD application controller is still syncing, continuing...${NC}"
}

echo -e "${GREEN}✓ ArgoCD core components are ready${NC}"
echo

#############################################
# Step 4: Verification
#############################################
echo "========================================="
echo "Step 4: Verification"
echo "========================================="

# Check ArgoCD pods
echo "ArgoCD pods status:"
$KUBECTL get pods -n argocd
echo

# Get ArgoCD admin password
echo "========================================="
echo "ArgoCD Admin Credentials"
echo "========================================="
echo "URL: https://argocd.codedang.com"
echo
echo "The admin password is stored in sealed secrets and will be available after sync."
echo "To retrieve the password, wait for the argocd-secret to be created, then run:"
echo "  $KUBECTL -n argocd get secret argocd-secret -o jsonpath='{.data.admin\\.password}' | base64 -d"
echo

# List ArgoCD applications
echo "========================================="
echo "ArgoCD Applications"
echo "========================================="
echo "Waiting for ArgoCD CRDs to be available..."
sleep 10

$KUBECTL get applications -n argocd 2>/dev/null || {
  echo -e "${YELLOW}⚠ ArgoCD Application CRD not yet available${NC}"
  echo "ArgoCD is still syncing. Check status with:"
  echo "  $KUBECTL get applications -n argocd"
}
echo

#############################################
# Completion
#############################################
echo "========================================="
echo "✅ Bootstrap script completed!"
echo "========================================="
echo
echo "Next steps:"
echo "1. Monitor ArgoCD sync progress:"
echo "   $KUBECTL get applications -n argocd -w"
echo
echo "2. Access ArgoCD UI:"
echo "   URL: https://argocd.codedang.com"
echo
echo "3. Verify all applications are synced:"
echo "   $KUBECTL get applications -n argocd"
echo
echo "4. Check infrastructure components:"
echo "   $KUBECTL get pods --all-namespaces"
echo
echo "========================================="
