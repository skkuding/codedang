# Alloy Iris profiling collector

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
