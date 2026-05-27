# Submission Load Test

채점 요청(`POST /api/submission`) 파이프라인의 부하 테스트입니다.

## 흐름

```
k6 (외부)
  → POST /api/auth/login (setup, 1회)
  → POST /api/submission (VU별 반복)
      → client-api → RabbitMQ → Iris (judge) → 결과 반환
```

## 시나리오

| 시나리오 | VU | 설명 |
|----------|---:|------|
| `normal_users` | 140 | 언어별 정답 코드 제출 (A+B) |
| `villain_users` | 10 | 자원 소모 악성 코드 제출 (무한루프, 메모리폭탄 등) |

**단계**: 2분 ramp-up → 10분 steady → 2분 ramp-down (총 14분)

## 사전 준비

1. **k6 설치**: https://grafana.com/docs/k6/latest/set-up/install-k6/
2. **테스트 문제**: production에 로드테스트 전용 문제 생성 (A+B 수준)
3. **테스트 계정**: production에 로드테스트 전용 계정 생성
4. **정답 코드**: 테스트 문제에 맞게 `payloads/normal/` 코드 수정

## 실행

```bash
cd tests/load
k6 run \
  -e BASE_URL=https://codedang.com/api \
  -e USERNAME=loadtest-user \
  -e PASSWORD=your-password \
  -e PROBLEM_ID=123 \
  --out experimental-prometheus-rw \
  --out "json=results/$(date +%Y%m%d-%H%M%S).json" \
  -e K6_PROMETHEUS_RW_SERVER_URL=https://prometheus.codedang.com/api/v1/write \
  submission-load.js
```

### 결과 출력

| 출력 | 용도 |
|------|------|
| **Prometheus** (`--out experimental-prometheus-rw`) | Grafana에서 RabbitMQ/Iris 메트릭과 같은 시간축으로 비교 |
| **JSON** (`--out json=results/...`) | 개별 요청 레벨 원본 데이터. 팀원별 보고서/분석에 활용 |
| **터미널** | 실행 중 실시간 요약 (VU, req/s, p95 등) |

`results/` 디렉토리의 JSON 파일은 `.gitignore`에 포함되어 커밋되지 않습니다.

## 환경변수

| 변수 | 필수 | 설명 |
|------|:----:|------|
| `BASE_URL` | | API 베이스 URL (기본: `https://codedang.com/api`) |
| `USERNAME` | O | 로그인 사용자명 |
| `PASSWORD` | O | 로그인 비밀번호 |
| `PROBLEM_ID` | O | 테스트 대상 문제 ID |
| `K6_PROMETHEUS_RW_SERVER_URL` | | Prometheus remote write URL (`--out` 사용 시) |

## Grafana 대시보드 가이드

테스트 실행 중/후 아래 대시보드에서 시스템 동작을 관찰할 수 있습니다.

### 1. k6 부하 메트릭

Prometheus에서 `k6_*` 접두사로 조회:

- `k6_http_req_duration` — API 응답 시간 (p50, p95, p99)
- `k6_http_reqs` — 초당 요청 수
- `k6_vus` — 활성 VU 수
- `k6_submission_errors` — 제출 실패 수
- `k6_submission_duration` — 제출 API 응답 시간

`user_type` 태그로 `normal` vs `villain` 필터링 가능.
`language` 태그로 언어별 필터링 가능.

### 2. RabbitMQ 메트릭

**대시보드**: RabbitMQ Overview (Grafana 대시보드 #10991)

핵심 지표:
- **Queue depth** (`client.q.judge.submission`) — 대기 중인 채점 요청 수
- **Publish rate** vs **Consume rate** — 병목 여부 판단
- **Message age** — 큐에서 대기하는 시간 = 채점 대기 시간

### 3. Iris 채점 워커

- **Pod CPU/Memory** — Kubernetes Cluster Overview 대시보드에서 `iris` 네임스페이스 필터
- **OTel Traces** — Tempo에서 `iris` 서비스의 span duration 조회

### 4. End-to-End Trace

Tempo에서 trace를 조회하면 단일 제출의 전체 경로를 볼 수 있습니다:

```
HTTP POST /submission → AMQP publish → Iris consume → judge → AMQP result
```

`AmqplibInstrumentation`이 활성화되어 있어 AMQP 구간이 자동 추적됩니다.

## 페이로드 구조

```
payloads/
├── normal/          # 정답 코드 (테스트 문제에 맞게 수정)
│   ├── solution.c
│   ├── solution.cpp
│   ├── solution.java
│   ├── solution.py        # Python3
│   └── solution.pypy.py   # PyPy3
└── villain/         # 자원 소모 악성 코드
    ├── infinite-loop.c       # CPU burn (무한 루프)
    ├── memory-bomb.cpp       # 메모리 대량 할당
    ├── output-flood.java     # stdout 대량 출력
    ├── resource-hog.py       # CPU + 메모리 동시 소모
    └── fork-attempt.pypy.py  # fork bomb (샌드박스 차단 테스트)
```

## 주의사항

- **production 실행 시** 비활성 시간대에 실행하세요
- 테스트 후 대량의 submission 레코드가 DB에 남습니다 — 정리 계획을 세우세요
- `prometheus.codedang.com`에 인증 없이 remote write가 열려 있습니다 — 테스트 후 접근 제한 추가를 권장합니다
