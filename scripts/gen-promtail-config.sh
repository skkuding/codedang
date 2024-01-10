#!/bin/bash

# .env 파일에서 환경변수 읽기
. ../.env

# promtail-config.yml 파일 생성
cat << EOF > /etc/promtail/promtail-config.yml
server:
  http_listen_port: 9080
  grpc_listen_port: 0
positions:
  filename: /var/log/positions.yaml
clients:
  - url: http://${LOKI_SERVER_URL}/loki/api/v1/push
scrape_configs:
  - job_name: codedang-dev
    docker_sd_configs:
      - host: unix:///var/run/docker.sock
        refresh_interval: 5s
    relabel_configs:
      - source_labels: ['__meta_docker_container_name']
        regex: '/(.*)'
        target_label: 'container'
EOF