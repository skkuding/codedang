# Alloy collector

The `alloy` ApplicationSet deploys one Alloy Pod per cluster in
`monitoring-alloy`. It discovers ready `iris`, `iris-test`, and `iris-rejudge`
Pods in the `iris` namespace and scrapes each Pod IP on port 6060. This does
not use the externally exposed pprof route or its basic authentication.

The collector samples CPU for 10 seconds every 60 seconds and also collects
the default memory and goroutine profiles. Block and mutex profiles are
disabled because Iris does not enable Go's block or mutex profiling rates.
It forwards profiles to the Pyroscope service installed by the preceding PR,
with `environment` and `service_name` labels to distinguish clusters and
Iris workloads. The Alloy ServiceMonitor exposes collector health metrics to
Prometheus.

After rollout, check the `alloy` Pod and its debug UI for discovered targets
and scrape errors, then confirm that Pyroscope receives profiles for all
three Iris service names. The Grafana data source is configured separately.

## Endpoint probing

`prometheus.exporter.blackbox` requests nine in-cluster HTTP addresses every
30 seconds and `prometheus.scrape` remote-writes the result to the Prometheus
receiver. Each probe carries `job="blackbox"` and `instance=<target name>`,
so `probe_success` and `probe_duration_seconds` are queryable per address.

The targets are the Services whose outage changes what someone can do:
`client-api`, `admin-api` and `frontend` for users, and `loki`, `tempo`,
`pyroscope`, `prometheus`, `alertmanager` and `grafana` for operators. Iris
and Plag are not probed: both consume RabbitMQ and expose no Service, so the
only HTTP port is the Iris pprof debug server, which says nothing about the
judge pipeline. Alloy does not probe itself, because a dead Alloy sends no
probes and its ServiceMonitor already reports collector health.

Probing adds no RBAC and no certificate metric. Cluster traffic is plaintext
HTTP, so the probe never sees a certificate; certificate expiry comes from
cert-manager instead.
