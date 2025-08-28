# How to setup Redis

1. Add the Helm chart repository

```sh
helm repo add ot-helm https://ot-container-kit.github.io/helm-charts/
```

2. Deploy the Redis operator

```sh
helm upgrade redis-operator ot-helm/redis-operator \
  --install --create-namespace --namespace redis-operator
```

3. Verify the operator installation

```sh
kubectl get pods -n redis-operator
NAME                              READY   STATUS    RESTARTS   AGE
redis-operator-5b75658bc4-n8872   1/1     Running   0          42s
```

4. Deploy Redis

define `values.yaml` for further configurations with [docs](https://ot-container-kit.github.io/redis-operator/guide/redis-config.html#helm-parameters)

```sh
helm upgrade redis ot-helm/redis --install --create-namespace --namespace redis-test -f values.yaml
```

## (Optional) How to setup Prometheus Operator

If you want to monitor Redis with Prometheus, you must deploy the Prometheus Operator and configure it to scrape Redis metrics.

https://github.com/prometheus-operator/prometheus-operator?tab=readme-ov-file#prometheus-operator

# Documentation

For more detailed information, please refer to the [official documentation](https://ot-container-kit.github.io/redis-operator/guide/).