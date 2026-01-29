## How to setup Argo CD to a new cluster

### 1. Install Argo CD via Helm

ArgoCD is managed via the official [Helm chart](https://artifacthub.io/packages/helm/argo/argo-cd) (`argo-cd`). Configuration is defined in `values.yaml`.

For the initial bootstrap, manually apply the ArgoCD Application:

```
kubectl create namespace argocd
kubectl apply -f applications/argocd.yaml
```

ArgoCD will then self-manage via the Helm chart and `values.yaml`.

### 2. Assign Cluster

**TODO: This section will be replaced with declarative management via `values.yaml` extraObjects.**

Open the Argo CD UI, and go to `Settings` > `Clusters`.

Add two clusters: production and stage, with appropriate URL.
