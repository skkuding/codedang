# Object storage in Kubernetes

This deployment is intended only for the stage environment.

Stage uses [PGSTY Silo](https://silo.pgsty.com/), a maintained MinIO fork, as
the application object store. Upstream MinIO community images were removed from
Docker Hub and quay.io, so the legacy MinIO Tenant was removed after the
cutover.

- `silo-statefulset.yaml` runs Silo on a retained 20Gi local-path volume.
- `silo-services.yaml` and `httproute.yaml` expose the S3 API and console.
- `users/*.yaml` hold the application credentials consumed by the services.

The MinIO Operator is still installed separately for the monitoring stack's
`monitoring-minio` Tenant; see `infra/k8s/monitoring/minio/`.

Strongly recommend using AWS S3 in production for reliability and scalability.
