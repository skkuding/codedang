# OpenTelemetry Collector(OTel Collector)

OTel Collector works as a single entrypoint for telemetry data(logs, metrics, traces).  
It receives, processes, and exports telemetry data to various backends(Loki, Prometheus, Tempo).

# OpenTelemetry Operator

We use [OpenTelemetry Operator](https://github.com/open-telemetry/opentelemetry-operator) to deploy OTel Collector.  
With Operator, we can easily manage the lifecycle of OTel Collector instances and their configurations.  
We only need to define [Custom Resource Definitions (CRDs)](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/) to specify the desired state of our OTel Collector instances.
Which is, in this case, `kind: OpenTelemetryCollector`

# How to deploy

1. Make sure the cert-manager is installed
https://cert-manager.io/docs/installation/

2. Install OpenTelemetry Operator to your cluster
```sh
kubectl apply -f https://github.com/open-telemetry/opentelemetry-operator/releases/latest/download/opentelemetry-operator.yaml
```

3. Create OpenTelemetry Collector instance
```sh
kubectl apply -f - <<EOF
apiVersion: opentelemetry.io/v1beta1
kind: OpenTelemetryCollector
metadata:
  name: simplest
spec:
  config:
    receivers:
      otlp:
        protocols:
          grpc:
            endpoint: 0.0.0.0:4317
          http:
            endpoint: 0.0.0.0:4318
    processors:
      memory_limiter:
        check_interval: 1s
        limit_percentage: 75
        spike_limit_percentage: 15
      batch:
        send_batch_size: 10000
        timeout: 10s

    exporters:
      debug: {}

    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: [memory_limiter, batch]
          exporters: [debug]
EOF
```
