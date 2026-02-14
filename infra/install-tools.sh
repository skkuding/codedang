#!/bin/bash
set -euo pipefail

#############################################
# Install Required Tools for Cluster Bootstrap
#
# This script installs the following tools:
# - kubectl (Kubernetes CLI)
# - helm (Kubernetes package manager)
# - aws (AWS CLI)
# - kubeseal (SealedSecrets CLI)
# - jq (JSON processor)
#
# Supported OS: Ubuntu/Debian
#############################################

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "Installing Required Tools"
echo "========================================="

# Verify apt-get is available
if ! command -v apt-get >/dev/null 2>&1; then
  echo -e "${RED}✗ apt-get not found. Only Debian/Ubuntu supported.${NC}"
  exit 1
fi

# Install kubectl
if ! command -v kubectl >/dev/null 2>&1; then
  echo "Installing kubectl..."
  sudo apt-get install -y apt-transport-https ca-certificates curl
  curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.31/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
  echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.31/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list
  sudo apt-get update && sudo apt-get install -y kubectl
  echo -e "${GREEN}✓ kubectl installed${NC}"
else
  echo -e "${YELLOW}⊙ kubectl already installed${NC}"
fi

# Install helm
if ! command -v helm >/dev/null 2>&1; then
  echo "Installing helm..."
  curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
  echo -e "${GREEN}✓ helm installed${NC}"
else
  echo -e "${YELLOW}⊙ helm already installed${NC}"
fi

# Install aws CLI
if ! command -v aws >/dev/null 2>&1; then
  echo "Installing aws CLI..."
  curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "/tmp/awscliv2.zip"
  unzip -q /tmp/awscliv2.zip -d /tmp
  sudo /tmp/aws/install
  rm -rf /tmp/awscliv2.zip /tmp/aws
  echo -e "${GREEN}✓ aws CLI installed${NC}"
else
  echo -e "${YELLOW}⊙ aws CLI already installed${NC}"
fi

# Install kubeseal
if ! command -v kubeseal >/dev/null 2>&1; then
  echo "Installing kubeseal..."
  KUBESEAL_VERSION="0.30.0"
  wget "https://github.com/bitnami-labs/sealed-secrets/releases/download/v${KUBESEAL_VERSION}/kubeseal-${KUBESEAL_VERSION}-linux-amd64.tar.gz" -O /tmp/kubeseal.tar.gz
  tar xfz /tmp/kubeseal.tar.gz -C /tmp
  sudo install -m 755 /tmp/kubeseal /usr/local/bin/kubeseal
  rm /tmp/kubeseal.tar.gz /tmp/kubeseal
  echo -e "${GREEN}✓ kubeseal installed${NC}"
else
  echo -e "${YELLOW}⊙ kubeseal already installed${NC}"
fi

# Install jq
if ! command -v jq >/dev/null 2>&1; then
  echo "Installing jq..."
  sudo apt-get install -y jq
  echo -e "${GREEN}✓ jq installed${NC}"
else
  echo -e "${YELLOW}⊙ jq already installed${NC}"
fi

echo
echo "========================================="
echo "✅ All tools installed successfully!"
echo "========================================="
echo
echo "Installed versions:"
kubectl version --client --short 2>/dev/null || kubectl version --client
helm version --short
aws --version
kubeseal --version
jq --version
echo
