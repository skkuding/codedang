# Infra legacy

> [!WARNING]
> These Terraform projects are retired and deliberately reject every Terraform
> version. Active AWS resources were adopted by `infra/aws`; resources awaiting
> removal are staged in `infra/aws/decommission-stage`.

코드당 인프라의 레거시 시스템을 남겨두었습니다.

이전에는 코드당 인프라가 production, rc, stage 3개의 환경으로 운영되었습니다.
production과 rc는 AWS에, stage는 자체 서버에서 docker-compose로 운영되었습니다.

현재는 비용 절감을 위해 대부분의 서비스를 자체 서버에서 kubernetes로 운영하고 있고, RDS, S3 등 일부 서비스만 AWS를 사용하고 있습니다.

The sanitized, non-deployable snapshot of retired AWS failover resources is in
[`archive/aws-failover`](archive/aws-failover/README.md).
