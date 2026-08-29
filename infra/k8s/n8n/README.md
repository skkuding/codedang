# n8n on Kubernetes

n8n is a workflow automation tool that enables you to connect various applications and services.
This directory contains the configuration to deploy n8n on a Kubernetes cluster using the [n8n Helm chart](https://community-charts.github.io/docs/category/n8n).

## How to install

1. Add the community charts repository:

```sh
helm repo add community-charts https://community-charts.github.io/helm-charts
```

2. Install or upgrade n8n:

```sh
helm upgrade --install n8n community-charts/n8n -f values.yaml -n n8n --create-namespace
```

## TODO

- [ ] Provisioning user, credentials and workflows
- [ ] Replace SQLite with PostgreSQL or MySQL for production use
- [ ] Replace binary data storage with s3 or minio for production use
- [ ] Enable Prometheus monitoring
