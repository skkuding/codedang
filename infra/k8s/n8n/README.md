# n8n on Kubernetes

n8n is a workflow automation tool that enables you to connect various applications and services.
This directory contains the configuration to deploy n8n on a Kubernetes cluster using the [n8n Helm chart](https://community-charts.github.io/docs/category/n8n).

## Deployment

n8n is currently installed manually with Helm and is not managed by Argo CD. Changes to `values.yaml` are not applied automatically, so run the Helm upgrade command after changing the configuration.

The chart version is pinned to `1.23.0`. This version supports both `extraManifests`, which is used to create the `HTTPRoute`, and `main.extraEnv`, which is used to load credentials from Secrets.

> [!WARNING]
> `values.yaml` does not match the installed release. Reconcile it with `helm get values n8n --namespace n8n` before running the upgrade below.
>
> - **Storage**: the release mounts the `n8n-data` PVC (`local-path-retain`, `skkuding-4f-1`). `values.yaml` sets no `main.persistence.existingClaim`, so the chart mounts `n8n-main-persistence`, whose volume is on the removed node `skkuding-4f-4`. With the `Recreate` strategy, the running Pod stops first and the new Pod stays `Pending`. Set `main.persistence.existingClaim: n8n-data`.
> - **Routing**: the release serves `n8n.codedang.com` through the chart `Ingress`. `values.yaml` disables the `Ingress` and adds an `HTTPRoute` on `https-wildcard`, so an upgrade switches routing to the Gateway.

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

## TODO

- [ ] Provisioning user, credentials and workflows
- [ ] Replace SQLite with PostgreSQL for production use
- [ ] Replace binary data storage with s3 or minio for production use
