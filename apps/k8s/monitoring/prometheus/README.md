# What is Prometheus?

Prometheus is an open-source monitoring and alerting toolkit to collect and store **metrics**.

# What is kube-prometheus-stack?
kube-prometheus-stack is a collection of Kubernetes manifests, Grafana dashboards, and Prometheus rules combined into a single package to provide a complete monitoring solution for Kubernetes clusters.

It contains the following components:
- Prometheus: for collecting and storing metrics
- Grafana: for visualizing metrics
- Node Exporter: for collecting hardware and OS metrics
- Kube-state-metrics: for collecting Kubernetes object metrics

# Why use kube-prometheus-stack?

kube-prometheus-stack automatically deploys and configures all the components needed for a complete monitoring solution for Kubernetes clusters.
With DaemonSets, it ensures that the Node Exporter is running on every node in the cluster, providing comprehensive hardware and OS metrics.

# Why not Grafana?

We use kube-prometheus-stack because it provides a complete monitoring solution for Kubernetes clusters.
However, in order to separate concerns and manage resources more effectively, we can deploy Grafana as a standalone application.
Grafana is not only for prometheus but also for other data sources, including Loki for logs and Tempo for traces.
