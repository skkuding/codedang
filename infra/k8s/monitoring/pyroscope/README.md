# Pyroscope

The `pyroscope` ApplicationSet deploys a single Pyroscope v2 instance to each
cluster's `monitoring-pyroscope` namespace. Stage reads `main` and retains
profiles for 14 days; production reads `release` and retains them for 30 days.

Profile blocks are stored in the `pyroscope` bucket of the existing monitoring
MinIO tenant. The 10Gi `local-path` PVC holds the v2 metastore's Raft state; it
is not the profile block store. The chart's bundled Alloy and MinIO are disabled.
The existing `monitoring-user` Secret is reflected into this namespace and
expanded from environment variables at Pyroscope startup.

The MinIO Tenant declares the bucket for new installations. An idempotent
init container also creates it on existing tenants before Pyroscope starts.
Reflector must copy `monitoring-user` into `monitoring-pyroscope` first. Check
the reflected Secret, init container, PVC, Pod readiness, and `/ready` endpoint
in that order.

This step provides the backend at
`http://pyroscope.monitoring-pyroscope.svc.cluster.local:4040`. Alloy scraping
and the Grafana data source are separate follow-up changes.
