# ArgoCD Setup

## How to setup Argo CD to a new cluster

### Option 1: Automated Bootstrap (Recommended)

Use the automated bootstrap script for complete cluster setup from scratch:

```bash
# For production cluster
cd infra
ENVIRONMENT=production ./bootstrap-cluster.sh

# For stage cluster
cd infra
ENVIRONMENT=stage CLUSTER_CONTEXT=stage ./bootstrap-cluster.sh
```

The script will:

1. Check/install required tools (`kubectl`, `helm`, `aws`, `kubeseal`, `jq`)
2. Install sealed-secrets controller
3. Restore encryption keys from AWS Secrets Manager
4. Install ArgoCD with self-management
5. Deploy all infrastructure components via GitOps

**Prerequisites:**

- Kubernetes cluster running and accessible
- AWS credentials configured with access to `Codedang-Sealed-Secrets-*` secrets

**Tool Installation:**

```bash
# Install tools separately (recommended)
cd infra
./install-tools.sh

# Or let bootstrap script auto-install (default)
AUTO_INSTALL_TOOLS=true ./bootstrap-cluster.sh

# Skip auto-install if tools already exist
AUTO_INSTALL_TOOLS=false ./bootstrap-cluster.sh
```

### Option 2: Manual Setup

#### 1. Install Sealed Secrets

ArgoCD depends on the SealedSecret CRD (its `values.yaml` contains SealedSecret resources). Install the sealed-secrets controller before bootstrapping ArgoCD:

```bash
helm repo add sealed-secrets https://bitnami-labs.github.io/sealed-secrets
helm install sealed-secrets sealed-secrets/sealed-secrets -n kube-system
```

If restoring an existing cluster, restore the encryption keys first. See [Sealed Secrets Key Restore Procedure](../../docs/sealed-secrets-restore.md).

#### 2. Install Argo CD via Helm

ArgoCD is managed via the official [Helm chart](https://artifacthub.io/packages/helm/argo/argo-cd) (`argo-cd`). Configuration is defined in `values.yaml`.

For the initial bootstrap, manually apply the ArgoCD Application:

```bash
kubectl create namespace argocd
kubectl apply -f applications/argocd.yaml
```

ArgoCD will then self-manage via the Helm chart and `values.yaml`.
