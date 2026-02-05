## How to setup Argo CD to a new cluster

### 1. Install Sealed Secrets

ArgoCD depends on the SealedSecret CRD (its `values.yaml` contains SealedSecret resources). Install the sealed-secrets controller before bootstrapping ArgoCD:

```
helm repo add sealed-secrets https://bitnami-labs.github.io/sealed-secrets
helm install sealed-secrets sealed-secrets/sealed-secrets -n kube-system
```

If restoring an existing cluster, restore the encryption keys first. See [Sealed Secrets Key Restore Procedure](../../docs/sealed-secrets-restore.md).

### 2. Install Argo CD via Helm

ArgoCD is managed via the official [Helm chart](https://artifacthub.io/packages/helm/argo/argo-cd) (`argo-cd`). Configuration is defined in `values.yaml`.

For the initial bootstrap, manually apply the ArgoCD Application:

```
kubectl create namespace argocd
kubectl apply -f applications/argocd.yaml
```

ArgoCD will then self-manage via the Helm chart and `values.yaml`.
