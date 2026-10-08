# Progress Server

Iris가 테스트케이스를 하나 채점할 때마다 보내는 `progress` 메시지를 받아,
채점 진행률을 WebSocket으로 프론트에 실시간 push하는 서버입니다.

```
Iris ──(RabbitMQ)──▶ Progress Server ──(WebSocket)──▶ Frontend
```

## 동작 방식

1. `iris.e.direct.judge` exchange(`judge.result` routing key)에 전용 큐
   `progress.q.judge.result`를 bind합니다.
   백엔드 큐(`iris.q.judge.result`)와 이름이 달라서, 같은 메시지의 복사본을 각각 받습니다.
2. `properties.type`이 `progress`인 메시지만 처리하고, 나머지 타입은 ack 후 무시합니다.
3. 제출별로 받은 `current`를 기록해 `완료 개수 / total`로 진행률을 계산합니다.
   같은 `current`가 다시 오면 무시합니다(중복 집계 방지).
4. 계산 결과를 해당 제출을 구독 중인 WebSocket 클라이언트에게 보냅니다.
5. 모든 테스트케이스를 받으면 `done`, 컴파일 에러·서버 에러면 `error`로 끝납니다.

## Iris 메시지 스펙

| 위치       | 필드         | 설명                             |
| ---------- | ------------ | -------------------------------- |
| properties | `type`       | `progress`                       |
| properties | `message_id` | submission id                    |
| body       | `total`      | 테스트케이스 개수                |
| body       | `current`    | 현재 테스트케이스 순서           |
| body       | `statusCode` | sandbox 실행 결과 코드 (아래 표) |

| 코드 | 상태                     |
| ---- | ------------------------ |
| 0    | RUN_SUCCESS              |
| 1    | CPU_TIME_LIMIT_EXCEEDED  |
| 2    | REAL_TIME_LIMIT_EXCEEDED |
| 3    | MEMORY_LIMIT_EXCEEDED    |
| 4    | RUNTIME_ERROR            |
| 5    | COMPILE_ERROR            |
| 6    | SEGMENTATION_FAULT_ERROR |
| 7    | SERVER_ERROR             |

> `RUN_SUCCESS`는 프로세스가 정상 종료됐다는 뜻일 뿐 정답(Accepted)이 아닙니다.
> 정답/오답 판정은 기존처럼 `GET submission/{id}`로 확인합니다.

## WebSocket 프로토콜

클라이언트 → 서버

```json
{ "type": "subscribe", "submissionId": 123 }
{ "type": "unsubscribe", "submissionId": 123 }
```

서버 → 클라이언트

```json
{
  "type": "progress",
  "submissionId": 123,
  "status": "judging",
  "completed": 2,
  "total": 5,
  "percentage": 40,
  "lastStatusCode": 0,
  "updatedAt": 1791425556973
}
```

- `status`: `judging` | `done` | `error`
- 구독 시점에 이미 진행 중이거나 막 끝난 채점이면 현재 상태를 즉시 한 번 보냅니다.

## 실행

루트에서 RabbitMQ를 띄운 뒤 실행합니다.

```bash
docker compose up -d rabbitmq
pnpm --filter @codedang/progress dev
```

환경변수는 백엔드와 같은 이름을 쓰며, 값이 없으면 루트 `docker-compose.yml`의 로컬 설정을 사용합니다.

| 변수                     | 기본값      |
| ------------------------ | ----------- |
| `WS_PORT`                | `8080`      |
| `RABBITMQ_HOST`          | `localhost` |
| `RABBITMQ_PORT`          | `5672`      |
| `RABBITMQ_DEFAULT_USER`  | `skku`      |
| `RABBITMQ_DEFAULT_PASS`  | `1234`      |
| `RABBITMQ_DEFAULT_VHOST` | `vh`        |
| `RABBITMQ_SSL`           | `false`     |
.