## How to setup MinIO

### Install MinIO Operator

Check: https://github.com/minio/operator?tab=readme-ov-file#procedure

```bash
kubectl kustomize github.com/minio/operator\?ref=v7.1.1 | kubectl apply -f -  # Replace v7.1.1 with the latest version
```
