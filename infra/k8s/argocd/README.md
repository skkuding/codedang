## How to setup Argo CD to a new cluster

### 1. Argo CD

```
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

### 2. Argo CD Image Updater

```
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj-labs/argocd-image-updater/stable/manifests/install.yaml
```

### 3. Setup Ingress

To access Argo CD via ingress, internal argocd-server should be edited to allow insecure connections.

```
kubectl -n argocd edit deployment argocd-server
```

```yaml
args:
- /usr/local/bin/argocd-server
- --insecure  # Add this line
```

and then apply the ingress manifest:

```
kubectl apply -f ingress.yaml
```

### 4. Assign Cluster

Open the Argo CD UI, and go to `Settings` > `Clusters`.

Add two clusters: production and stage, with appropriate URL.

### 5. Enable GitHub Login

To enable GitHub login, type following command to edit the Argo CD config map:

```
kubectl -n argocd edit configmap argocd-cm
```

Add the following lines to the `data` section:

```yaml
data:
  dex.config: |
    connectors:
      - type: github
        id: github
        name: GitHub
        config:
          clientID: <your-client-id>
          clientSecret: <your-client-secret>
          useLoginAsID: true
          orgs:
            - name: skkuding
```

Also edit the `argocd-rbac-cm` config map to allow GitHub users to access Argo CD:

```
kubectl -n argocd edit configmap argocd-rbac-cm
```

Add the following lines to the `data` section:

```yaml
data:
  policy.csv: |
    p, role:admin, applications, *, */*, allow
    p, role:admin, clusters, *, *, allow
    p, role:admin, repositories, *, *, allow
  policy.default: role:admin
```

## How to test a change

By default, applications/argocd.yaml tries to sync all applications to main branch's yaml manifests.

To test a change, you should disable the auto-sync feature of the application, and then `kubectl apply -f` your modified yaml manifests to the cluster.

```yaml
# applications/argocd.yaml

spec:
  syncPolicy: null  # Disable auto-sync
    # prune: true
    # selfHeal: true
```
