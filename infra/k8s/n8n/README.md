## How to install

1. Add the community charts repository:

```sh
helm repo add community-charts https://community-charts.github.io/helm-charts
```

2. Install or upgrade n8n:

```sh
helm upgrade --install n8n community-charts/n8n -f values.yaml -n n8n --create-namespace
```
