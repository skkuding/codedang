# Codedang 부하 테스트

이 저장소는 Codedang 플랫폼의 주요 기능에 대한 부하 테스트 스크립트 및 관련 설정을 포함합니다. k6를 사용하여 테스트를 실행하고, OpenTelemetry를 통해 메트릭을 수집하여 Grafana에서 시각화하는 것을 목표로 합니다.

## 목차

* [개요](#개요)
* [사전 준비](#사전-준비)
* [설정](#설정)
* [사용 방법](#사용-방법)
* [결과 확인](#결과-확인)
* [스크립트 개요](#스크립트-개요)
* [메트릭 설명](#메트릭-설명)

## 개요

이 부하 테스트는 로그인 API(`/auth/login`), 회원가입 API(`/user/sign-up`), 코드 제출 API(`/submission`)에 중점을 두어, 일반 사용자(normal)와 잠재적 악성 사용자(villain) 유형의 시나리오를 분리하여 실행합니다. 이를 통해 다양한 조건 하에서 시스템의 성능, 안정성 및 응답 시간을 측정하고 병목 현상을 파악합니다.

## 사전 준비

테스트를 실행하기 전에 다음 사항들이 준비되어야 합니다:

1.  k6 설치: 로컬 환경에 k6가 설치되어 있어야 합니다. ([k6 공식 문서](https://grafana.com/docs/k6/latest/set-up/install-k6/) 참고)
2.  테스트 대상 환경: 부하 테스트를 실행할 Codedang 백엔드 환경이 준비되어 있어야 합니다.
3.  모니터링 스택: k6 메트릭을 수신할 OpenTelemetry Collector 및 시각화를 위한 Prometheus, Grafana 스택이 실행 중이어야 합니다 ([codedang-monitor](https://github.com/skkuding/codedang-monitor) 저장소 참고).

## 설정

1.  환경변수 설정:
    * `loadtest` 디렉토리 안에 `.env.development` 파일을 환경에 맞게 수정합니다.
    * 일반적으로 수정 없이 그대로 사용하면 됩니다.
    * 아래 내용을 참고하여 필요한 환경 변수를 설정합니다.

        ```bash
        CODEDANG_BASE_URL=http://localhost:4000 # 테스트 대상 Codedang API 서버 주소
        K6_OTEL_EXPORTER_OTLP_ENDPOINT=localhost:4317 # OTel Collector OTLP/gRPC 엔드포인트 (스킴 제외)
        LOGIN_USERNAME=instructor # 테스트에 사용할 계정 이름
        LOGIN_PASSWORD=Instructorinstructor # 테스트 계정 비밀번호
        K6_OTEL_GRPC_EXPORTER_INSECURE=true # OTel Collector가 TLS 없이 gRPC를 수신하는 경우 true로 설정
        ```

2.  테스트 코드 파일 준비:
    * `loadtest/scripts/villain/` 디렉토리에 악성 또는 비정상 패턴의 C 코드 파일(`1.c`, `2.c` 등)을 배치합니다.
    * `loadtest/scripts/normal/` 디렉토리에 정상적인 C 코드 파일(`1.c`, `2.c` 등)을 배치합니다.
    * 중요: `loadtest/scripts/submission/index.ts` 파일 상단의 `getCodeSnippets` 함수 호출 시, 각 디렉토리에 실제 배치된 파일 개수와 일치하도록 `numberOfCodeFiles` 인자 값을 수정해야 합니다. (예: `getCodeSnippets('villain', 5)` - `villain` 폴더에 `5`개의 파일이 있는 경우)

## 사용 방법

VSCode 에서 `Ctrl + Shift + P` (또는 `Cmd + Shift + P`)를 눌러 Command Palette를 열고 `Tasks: Run Task`를 선택한 후, 실행할 테스트 시나리오 Task를 선택합니다.

* `k6: Run Login Test (dotenv)`: 로그인 API 부하 테스트 실행
* `k6: Run Signup Test (dotenv)`: 회원가입 API 부하 테스트 실행
* `k6: Run Submission Test (dotenv)`: 코드 제출 API 부하 테스트 실행 (Villain/Normal 시나리오 포함)

또는 터미널에서 직접 실행할 수도 있습니다 (프로젝트 루트 디렉토리 기준):

```bash
npx dotenv-cli -e ./loadtest/.env.development -- k6 run --out experimental-opentelemetry ./loadtest/scripts/submission/index.ts
```
* `--out` 옵션 값 `(otel 또는 experimental-opentelemetry)`은 k6 버전 및 설정에 따라 적절히 선택합니다.

## 결과 확인

1.  k6 터미널 출력: 테스트 실행 중 및 완료 후 k6가 터미널에 요약 정보(요청 성공/실패율, 응답 시간 통계 등)를 출력합니다.
2.  Grafana 대시보드:
    * k6 실행 시 설정된 `K6_OTEL_EXPORTER_OTLP_ENDPOINT`로 메트릭이 전송됩니다.
    * [codedang-monitor](https://github.com/skkuding/codedang-monitor) 스택의 Grafana에 접속하여 관련 대시보드(k6 전용 대시보드 또는 시스템 리소스 대시보드 등)를 통해 실시간 메트릭 및 테스트 결과를 시각적으로 확인합니다.
    * 아래 "메트릭 설명" 섹션의 메트릭과 태그를 활용하여 데이터를 필터링하고 분석할 수 있습니다.

## 스크립트 개요

* `loadtest/scripts/login.ts`: 로그인 API (`/login`) 부하 테스트 스크립트
* `loadtest/scripts/signup.ts`: 회원가입 API 부하 테스트 스크립트
* `loadtest/scripts/submission/index.ts`: 코드 제출 API (`/submission`) 부하 테스트 스크립트.
    * `villainScenario`: '악성' 코드를 제출하는 가상 사용자 시나리오.
    * `normalScenario`: '정상' 코드를 제출하는 가상 사용자 시나리오.
    * Scenarios 기능을 사용하여 두 유형의 사용자를 정의된 비율 및 부하 패턴으로 실행합니다.

## 메트릭 설명

| 메트릭 이름 (Metric Name)         | 타입 (Type) | 설명 (Description)                                                                                                   | 관련 태그 (Applicable Tags)                             |
| :------------------------------ | :---------- | :------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------ |
| **Built-in Metrics (k6 기본 제공)** |             |                                                                                                                      |                                                         |
| `vus`                           | Gauge       | 현재 활성 상태인 가상 사용자(VU) 수.                                                                     | `user_type` (villain/normal)                            |
| `vus_max`                       | Gauge       | 테스트 실행 중 도달 가능한 최대 VU 수.                                                                       | `user_type` (villain/normal)                            |
| `iterations`                    | Counter     | 각 시나리오(`villainScenario`, `normalScenario`) 함수가 완료된 총 횟수.                                  | `user_type` (villain/normal)                            |
| `iteration_duration`            | Trend       | 각 VU가 시나리오 함수(`villainScenario` 또는 `normalScenario`)를 한 번 완전히 실행하는 데 걸린 시간 (ms). (avg, p95 등 집계) | `user_type` (villain/normal)                            |
| `http_reqs`                     | Counter     | k6가 생성한 총 HTTP 요청 수.                                                                             | `scenario`, `user_type`, `snippet_type`                 |
| `http_req_duration`             | Trend       | HTTP 요청이 시작되어 응답을 완전히 받을 때까지 걸린 시간 (ms). (avg, p95 등 집계)                               | `scenario` (login/submission), `user_type`, `snippet_type` |
| `http_req_failed`               | Rate        | 실패한 HTTP 요청의 비율 (0 ~ 1).                                                                                | `scenario`, `user_type`, `snippet_type`                 |
| `http_req_blocked`              | Trend       | TCP 연결 슬롯을 기다리는 등 요청 시작 전에 블로킹된 시간 (ms).                                              | `scenario`, `user_type`, `snippet_type`                 |
| `http_req_connecting`           | Trend       | 원격 호스트와 TCP 연결을 설정하는 데 걸린 시간 (ms).                                                    | `scenario`, `user_type`, `snippet_type`                 |
| `http_req_tls_handshaking`      | Trend       | 원격 호스트와 TLS 세션을 협상하는 데 걸린 시간 (ms). (HTTPS 사용 시)                                         | `scenario`, `user_type`, `snippet_type`                 |
| `http_req_sending`              | Trend       | 요청 데이터를 원격 호스트로 전송하는 데 걸린 시간 (ms).                                                     | `scenario`, `user_type`, `snippet_type`                 |
| `http_req_waiting`              | Trend       | 요청 전송 완료 후 응답의 첫 바이트를 수신할 때까지 대기한 시간 (TTFB) (ms).                                 | `scenario`, `user_type`, `snippet_type`                 |
| `http_req_receiving`            | Trend       | 원격 호스트로부터 응답 데이터를 완전히 수신하는 데 걸린 시간 (ms).                                        | `scenario`, `user_type`, `snippet_type`                 |
| `data_sent`                     | Counter     | 테스트 중 전송된 총 데이터 양 (bytes).                                                                    | (요청별 태그는 기본 제공 안 됨)                         |
| `data_received`                 | Counter     | 테스트 중 수신된 총 데이터 양 (bytes).                                                                    | (요청별 태그는 기본 제공 안 됨)                         |
| `checks`                        | Rate        | `check()` 함수의 성공률 (0 ~ 1).                                                                               | `check` (체크 이름), `scenario`, `user_type`, `snippet_type` |
| **Custom Metrics (스크립트 정의)** |             |                                                                                                                      |                                                         |
| `login_latency`                 | Trend       | 로그인 API (`/auth/login`) 요청의 전체 응답 시간 (ms). (avg, p95 등 집계)                                                   | `user_type` (villain/normal)                            |
| `submission_latency`            | Trend       | 코드 제출 API (`/submission`) 요청의 전체 응답 시간 (ms). (avg, p95 등 집계)                                               | `user_type` (villain/normal), `snippet_type` (villain/normal) |

**태그(Tags) 설명:**

* **`user_type`**: 각 시나리오(`villains`, `normals`)에 자동으로 할당되어 빌런/일반 사용자 그룹을 구분합니다.
* **`scenario`**: 각 HTTP 요청 시 명시적으로 설정되어(`login`, `submission`), 어떤 API 호출과 관련된 메트릭인지 구분합니다.
* **`snippet_type`**: 코드 제출 관련 메트릭에만 적용되며, 제출된 코드가 `villain`인지 `normal`인지 구분합니다.
* **`check`**: `check()` 함수에 자동으로 생성되며, 각 체크의 이름을 값으로 가집니다.