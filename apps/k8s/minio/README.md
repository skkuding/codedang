# MinIO in Kubernetes

This deployment is intended only for stage environment.

It is ideal to use AWS S3 in stage environment, to mock as close as possible the production environment.
However, we've decided to use on-premise MinIO in stage environment for following reasons:

- Postgres is already deployed on-premise in stage environment, so we want to keep all dependencies on-premise.
- Save costs on AWS S3 usage.

Strongly recommend to use AWS S3 in production environment for better reliability and scalability.

## How to setup MinIO

### Install MinIO Operator

Check: https://github.com/minio/operator?tab=readme-ov-file#procedure

```bash
kubectl kustomize github.com/minio/operator\?ref=v7.1.1 | kubectl apply -f -  # Replace v7.1.1 with the latest version
```
