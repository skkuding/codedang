# progress-server (v2)

지난 회의에서 정리한 구조("NestJS는 결과를 모아서 DB 저장, Progress Server는 같은 결과를
RabbitMQ에서 따로 받아서 진행률을 WebSocket으로 push")를 그대로 반영한 스켈레톤입니다.
`npx tsc --noEmit` 통과 확인했고, `db.ts`만 실제 DB/API 연동으로 채우면 바로 돌아갑니다.

## 핵심 알고리즘 (src/progressStore.ts)

1. RabbitMQ에서 TC 결과 메시지가 온다 (`submissionId` + `testcaseId` + 결과가 항상 같이 옴 —
   codedang 코드로 확인됨, 그래서 "SubmissionId 못 받아서 임시 저장" 로직은 없음).
2. 해당 submissionId의 상태가 메모리에 없으면, 총 TC 개수를 처음 한 번만 조회해서 상태를 만든다.
3. 같은 testcaseId가 이미 처리됐으면 무시한다 (RabbitMQ는 최소 1번 이상 전달을 보장하는 방식이라
   중복 수신 가능 → dedupe 필수).
4. 새 testcaseId면 완료 집합에 추가하고 `완료 개수 / 전체 개수`로 퍼센트를 계산한다.
5. judgeResult가 없는 메시지(컴파일 에러/서버 에러)는 나머지 TC를 기다리지 않고 즉시 종료 처리한다.
6. 계산된 진행상황을 WebSocket 쪽 broadcast 함수로 넘긴다.
7. 채점이 끝나면(done/error) 약간의 유예 후 메모리에서 상태를 정리한다 (뒤늦게 오는 중복 메시지 대응).

## 파일 구성

- `src/types.ts` — Iris 메시지 스펙(JudgerResultMessage) 및 내부 상태 타입
- `src/progressStore.ts` — **알고리즘 핵심.** submission별 진행상황 관리
- `src/rabbitConsumer.ts` — `iris.e.direct.judge` exchange에 Progress Server 전용 큐를
  bind해서 TC 결과를 구독 (NestJS의 `iris.q.judge.result`와 별개 큐 — 서로 경쟁하지 않고
  각자 전체 메시지를 받음)
- `src/wsServer.ts` — WebSocket 연결/구독 관리, submission별 broadcast
- `src/db.ts` — 총 TC 개수 조회 (지금은 자리표시자, 실제 연동 필요)
- `src/server.ts` — 위 모듈들을 엮어서 실행

## 실행

```
npm install
AMQP_URL=amqp://<host> npm run dev
```

## 아직 팀이랑 정해야 하는 것 (코드만으로는 답이 안 나오는 부분)

1. **RabbitMQ 접속 정보** — Progress Server가 `iris.e.direct.judge` exchange에 자체 큐를
   bind하는 방식으로 가도 되는지, host/vhost/계정 정보를 받을 수 있는지.
2. **총 TC 개수 조회 방법** (`db.ts`) — codedang DB에 read-only로 직접 붙을지, 아니면
   NestJS가 내부 API를 하나 열어줄지. 전자가 더 간단하지만 DB 스키마/커넥션 정보 공유가 필요함.
3. **WebSocket 구독 프로토콜** — 지금은 `{ type: "subscribe", submissionId }`로 임의로
   정했는데, 프론트엔드(정빈님/다른 팀원)와 실제 메시지 포맷을 맞춰야 함.
4. **Progress Server를 나중에 여러 대로 늘릴 때** — 지금 구현은 메모리(Map)에 상태를
   들고 있어서 인스턴스가 1대일 때만 정확하게 동작함. 여러 대로 늘리면 "RabbitMQ 메시지는
   인스턴스 A가 받고, 그 유저의 WebSocket은 인스턴스 B에 연결된" 상황이 생겨서 진행률이
   전달되지 않을 수 있음. 지금 범위 밖이지만, 나중에 필요해지면 Redis pub/sub 같은 것으로
   인스턴스 간에 진행상황을 공유하는 방식을 고려해야 함.
