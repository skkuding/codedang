#!/bin/sh
# Grafana가 뜨기 전에 커뮤니티 대시보드를 grafana.com에서 받아 공유 볼륨에 둔다.
# 클러스터 Grafana(infra/k8s/monitoring/grafana)처럼 gnetId와 revision으로만 관리한다.
# 받지 못해도(오프라인 등) Grafana 기동은 막지 않고, 이전에 받은 파일이 있으면 그대로 쓴다.
set -u

DEST=/dashboards

# gnetId:revision:파일이름
DASHBOARDS="
10991:12:rabbitmq-overview
15983:30:otel-collector
"

for entry in $DASHBOARDS; do
  id=${entry%%:*}
  rest=${entry#*:}
  rev=${rest%%:*}
  name=${rest#*:}
  tmp="$DEST/.$name.json"

  if curl -fsSL --max-time 30 -o "$tmp" "https://grafana.com/api/dashboards/$id/revisions/$rev/download"; then
    # 대시보드의 데이터소스 입력값을 로컬 Prometheus 데이터소스 uid로 바꾼다.
    sed 's/\${DS_PROMETHEUS}/prometheus/g' "$tmp" > "$DEST/$name.json"
    echo "downloaded $name (gnetId $id, revision $rev)"
  else
    echo "failed to download $name (gnetId $id, revision $rev)" >&2
  fi
  rm -f "$tmp"
done
