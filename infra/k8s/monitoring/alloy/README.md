# Alloy collector

The `alloy` ApplicationSet deploys one Alloy Pod per cluster in
`monitoring-alloy`. It runs two independent pipelines: Iris pprof profiles to
Pyroscope, and cluster-wide Kubernetes Events to Loki.

## Iris profiling

Discovers ready `iris`, `iris-test`, and `iris-rejudge` Pods in the `iris`
namespace and scrapes each Pod IP on port 6060. This does not use the
externally exposed pprof route or its basic authentication.

The collector samples CPU for 10 seconds every 60 seconds and also collects
the default memory and goroutine profiles. Block and mutex profiles are
disabled because Iris does not enable Go's block or mutex profiling rates.
Profiles carry `environment` and `service_name` labels to distinguish clusters
and Iris workloads.

## Kubernetes Events

`loki.source.kubernetes_events` watches Events in every namespace and writes
them to Loki under `job="kubernetes-events"` with an `environment` label. Event
objects expire from etcd after roughly one hour, so `OOMKilled`,
`FailedScheduling`, `Evicted`, `Unhealthy`, and `BackOff` reasons are otherwise
unavailable for post-incident analysis. Loki retains them for 90 days.

Alloy tracks its read position under `--storage.path=/tmp/alloy`, which the
chart does not back with a volume, so a Pod restart replays the Events still in
etcd. Loki accepts out-of-order writes but rejects entries more than one hour
behind a stream's newest entry (`max_chunk_age / 2`), and drops exact duplicates
silently. A restart can therefore lose the oldest Events of the replay window
while the collector stays healthy.

Lines are emitted as JSON, so LogQL parses fields with `| json`:

```logql
{job="kubernetes-events", environment="production"} | json | reason = "OOMKilled"
```

## RBAC

Pod discovery uses a namespaced Role in `iris` only, rendered from the chart's
`rbac.namespaces`. Event watching is cluster-scoped, and the chart renders
either namespaced Roles or a ClusterRole but never both — it drops
`rbac.clusterRules` while `rbac.namespaces` is set. The events ClusterRole and
ClusterRoleBinding are therefore declared in `extraObjects`, granting read-only
access to `events` in the core API group and nothing else.

## Verification

After rollout, check the `alloy` Pod and its debug UI on port 12345 for
component health, discovered targets, and scrape errors. Then confirm that
Pyroscope receives profiles for all three Iris service names, and that
`{job="kubernetes-events"}` returns rows in Grafana Explore — restarting a Pod
produces events within seconds. RBAC failures appear as forbidden errors in the
Alloy Pod log rather than as a failed sync.
