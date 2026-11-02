# Grafana database access

CloudBeaver(`beaver.stage.codedang.com`)를 없애고, 같은 용도(DB 직접 조회)를 Grafana의
읽기 전용 PostgreSQL 데이터소스로 옮겼다. 조회는 Grafana Explore 또는
`Database Overview` 대시보드에서 한다.

## 읽기 전용 계정

Grafana는 `grafana_ro` 로 접속한다. SELECT 만 가능하고 세션 기본값이 read-only라서
실수로 쓰기 쿼리를 실행해도 거부된다.

```sql
CREATE ROLE grafana_ro LOGIN PASSWORD '<password>';
ALTER ROLE grafana_ro CONNECTION LIMIT 5;
ALTER ROLE grafana_ro SET default_transaction_read_only = on;
GRANT pg_monitor TO grafana_ro;
GRANT CONNECT ON DATABASE skkuding TO grafana_ro;
GRANT USAGE ON SCHEMA public TO grafana_ro;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO grafana_ro;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO grafana_ro;
```

`pg_monitor` 는 다른 세션의 쿼리·락을 볼 수 있게 해 주는 읽기 전용 기본 role 이다.
새 테이블을 만든 role 이 `ALTER DEFAULT PRIVILEGES` 를 실행하지 않으면 새 테이블은
보이지 않으므로, 스키마 소유자가 바뀌면 위 SQL 을 다시 실행한다.

## 비밀번호

`overlays/<env>/database-credentials.yaml` 의 SealedSecret(`grafana-database-credentials`)
`GRAFANA_DB_PASSWORD` 키로 들어 있다. 다시 봉인할 때는 **대상 클러스터의** 인증서를 쓴다.

```bash
kubectl -n kube-system get secret -l sealedsecrets.bitnami.com/sealed-secrets-key \
  -o jsonpath='{.items[0].data.tls\.crt}' | base64 -d > /tmp/sealed-cert.pem

kubectl create secret generic grafana-database-credentials -n monitoring-grafana \
  --from-literal=GRAFANA_DB_PASSWORD='<password>' --dry-run=client -o yaml \
  | kubeseal --cert /tmp/sealed-cert.pem --format yaml \
  > overlays/stage/database-credentials.yaml
```

## 대시보드

`overlays/stage/dashboards/db-overview.json` (Database Overview). kustomize 가
ConfigMap `grafana-db-dashboards` 로 만들고, values 의 `dashboardsConfigMaps` 가
`/var/lib/grafana/dashboards/db-dashboards` 에 마운트한다. 새 대시보드는 같은
디렉터리에 JSON 을 추가하고 `configMapGenerator` 에 넣으면 된다.

대시보드는 `pg_stat_*` 의 현재 값 스냅샷이라 시계열 변화는 보여주지 않는다.
추세가 필요하면 Explore 에서 직접 쿼리한다.
