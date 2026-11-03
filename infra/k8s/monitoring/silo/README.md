# Monitoring Silo

The stage MinIO overlay includes this module to run Silo alongside the existing
monitoring MinIO tenant in the `monitoring-minio` namespace.

## Deployment scope

The `minio-monitoring-stage` Argo CD application tracks `main` and syncs
automatically. Merging this overlay change into `main` deploys one Silo Pod,
the `silo` and `silo-headless` Services, and the `silo-data` PVC.

Loki, Tempo, and Pyroscope continue using the existing `minio` endpoint.
The production overlay follows `release` and does not include Silo yet.

## Storage and access

Silo uses a separate 100Gi `local-path` PVC. The existing MinIO volume remains
attached to MinIO; adding Silo does not copy its data.

The existing `tenant-config` Secret supplies `config.env`. Reusing it supplies
server configuration and root credentials, but does not create the
`monitoring-user` account, its policies, or the monitoring buckets in Silo.

The internal S3 endpoint is `http://silo.monitoring-minio.svc.cluster.local:80`.
The console is available on the `silo` Service at port 9090. Its browser redirect
retains the existing Tenant value, `https://monitoring.minio.codedang.com`;
this step does not add a stage HTTPRoute.

## Remaining migration steps

1. Confirm Silo readiness and authenticated S3 access after stage deployment.
2. Migrate the `loki`, `tempo`, and `pyroscope` buckets, objects, and monitoring
   user permissions while keeping the original MinIO available.
3. Pause writers, finish the final sync, then switch the stage consumers to Silo.
   Verify reads and writes before retiring the original MinIO resources.
4. Add production overlay wiring after stage validation, then promote through
   `release`.
