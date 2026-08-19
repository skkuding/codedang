# 채점 결과 쓰기 비동기화 / 배치 파이프라인 설계

> 목표: 대회 시작·과제 마감처럼 채점이 폭주할 때 PostgreSQL이 죽지 않도록, 채점 결과 쓰기 경로를 비동기·배치 구조로 재설계한다. 핵심은 **쓰기 경로 분리 + 핫 로우 제거**다.

## 1. 현재 구조와 병목 (코드 기준)

채점 결과 흐름:

```
iris (judge-handler.go)  →  RabbitMQ  →  SubmissionSubscriptionService (submission-sub.service.ts)  →  PostgreSQL
```

확인된 사실:

- **iris는 테스트케이스마다 메시지 1건을 발행한다.** `judge-handler.go`의 `Handle()`가 `for i := range tcNum` 루프 안에서 `judgeTestcase()`를 호출하고, 각 호출이 `out <- JudgeResultMessage{...}`로 결과 1건을 내보낸다. 케이스 50개 = 메시지 50건.
- **consumer는 메시지 1건마다 무거운 경로 전체를 실행한다.** `handleJudgerMessage` → `updateTestcaseJudgeResult`가 매 메시지마다:
  1. `submissionResult.update` — 행 1개 갱신
  2. `problemTestcase.update { increment }` — **핫 로우** (같은 문제·케이스에 동시 제출이 전부 같은 행을 UPDATE → row lock 직렬화)
  3. `updateSubmissionResult(submissionId)` — **매 메시지마다** 실행. `submissionResult.every` 조건으로 "전부 채점 끝났나"를 확인하는데, 50건 중 49건은 `null`을 반환하고 버려진다. 즉 무거운 조인 쿼리를 49번 헛돌린다.
- **마지막 케이스에서 종료 캐스케이드가 터진다:**
  - `submission.update` (최종 result)
  - `updateSubmissionScore` — findUniqueOrThrow + (대회면) `problemTestcase.findMany` + `submission.update`
  - `updateProblemAccepted` — **read-modify-write**로 `acceptedRate` 계산 후 `problem.update`. 핫 로우 + **경쟁 조건**(동시 갱신 시 lost update, 정답률 부정확)
  - `updateContestRecord` — `userContest.findFirst` + `Promise.all`(쿼리 4개) + `firstSolver.create` + `$transaction`(upsert + aggregate + update). 무겁고 `contestRecord`가 또 핫 로우.

**대략적 비용 (케이스 50개 제출 1건):**
`50 × (update 1 + 핫 update 1 + 무거운 조인 1) + 종료 캐스케이드 ~10` ≈ **DB 연산 160회 이상**, 핫 로우 경합 지점 3곳(`problem_testcase`, `problem`, `contest_record`). 이걸 수천 건이 동시에 → 락 폭주 → 트랜잭션 적체 → 커넥션 풀 고갈 → 채점과 무관한 API까지 동반 사망.

추가 문제:
- **배치가 전혀 없다.** 모든 연산이 개별 autocommit 문 → 라운드트립·짧은 트랜잭션 폭증.
- **에러 시 `throw` → Nack → 재큐잉.** 폭주 중엔 재처리 폭풍으로 악화. DLQ 없음.

## 2. 설계 원칙

1. **AMQP 소비와 DB 쓰기를 분리한다.** consumer는 빠르게 ack하고, 실제 쓰기는 별도 워커가 배치로 수행.
2. **테스트케이스 N건 메시지를 제출당 쓰기 1회로 접는다.** `updateSubmissionResult`를 N번이 아니라 1번만.
3. **핫 카운터를 동기 경로에서 뺀다.** Redis에 누적 후 주기적 flush(원자적 SQL 증분).
4. **정합성이 필요한 것(점수·순위)만 트랜잭션 유지**하되, 키 단위로 직렬화하고 배치로 처리.
5. **폭주를 broker가 흡수한다.** prefetch·동시성 상한으로 backpressure, 큐(durable)에 쌓이게.

## 3. 목표 아키텍처

```
iris ──(per-testcase, 실시간 UX용)──▶ RabbitMQ ──▶ consumer
                                                     │  ① 결과를 Redis 버퍼에 적재 + 카운트 증가, 즉시 ack
                                                     ▼
                                          Redis: submission:{id}:results (hash)
                                                     │  ② count == expected 또는 타임아웃 → finalize 잡 enqueue
                                                     ▼
                                          Finalize Worker (마이크로 배치, 100ms/200건)
                                                     │  ③ 제출 묶음을 트랜잭션으로 일괄 기록
                                                     ▼
                                          PostgreSQL (PgBouncer 경유)
                                                     ▲
                          핫 카운터 flush 스케줄러 ───┘  ④ Redis 누적 델타 → 원자적 UPDATE
```

### Layer 1 — (선택, 최선) iris에서 소스 집계
iris가 케이스별 결과를 **실시간 UX용 라이트 익스체인지**로는 계속 스트리밍하되(유저가 케이스 채점되는 걸 실시간으로 봄), **영속화용으로는 제출당 결과 배열 1건**을 마지막에 한 번 발행한다. 실시간 느낌을 유지하면서 DB 쓰기 트리거는 1회로 줄인다. iris를 못 건드리면 Layer 2의 consumer 측 집계로 대체.

### Layer 2 — consumer 측 집계 버퍼
- consumer는 케이스 결과를 **Redis 해시** `submission:{id}:results`에 적재하고 카운터를 `HINCRBY`. **즉시 ack** (DB를 기다리지 않음 → ack 지연 제거).
- 라이브 UX용 캐시 갱신은 지금처럼 유지(테스트 실행 결과는 이미 cache-manager 사용 중).
- `count == expectedTestcaseCount` 또는 타임아웃 도달 시 **finalize 잡**을 큐에 넣는다. → `updateSubmissionResult`의 헛도는 49회가 사라지고 제출당 1회만 남는다.

### Layer 3 — 배치 DB 워커
finalize 잡을 **마이크로 배치**로 처리(예: 100ms 동안 또는 200건이 모이면 드레인):

- 버퍼에 모인 결과로 최종 result·score를 **앱에서 계산**(재조회 없음).
- `submission_result`는 개별 `update` N회 대신 **단일 다중행 문**으로 기록:
  - 신규면 `createMany`(`skipDuplicates: true`)
  - 기존 행 갱신이면 `UNNEST` 기반 단일 `$executeRaw` 벌크 UPDATE
- `submission.update`(최종 result/score)도 배치 트랜잭션 1개로 묶는다.

수천 개의 작은 트랜잭션 → 몇 개의 굵은 트랜잭션으로 압축 → 라운드트립·락 churn 급감.

### Layer 4 — 핫 카운터: 누적 + 주기 flush
`problem_testcase`(submissionCount/acceptedCount), `problem`(submissionCount/acceptedCount/acceptedRate)을 제출마다 갱신하지 않는다.

- 채점 완료 시 Redis에서 델타만 `HINCRBY`.
- 스케줄러(예: 2~5초마다)가 누적 델타를 **단일 원자적 SQL**로 반영:

```sql
UPDATE problem
SET submission_count = submission_count + $delta_sub,
    accepted_count   = accepted_count   + $delta_acc,
    accepted_rate    = (accepted_count + $delta_acc)::float
                       / NULLIF(submission_count + $delta_sub, 0)
WHERE id = $id;
```

→ read-modify-write 경쟁 조건 제거(현재 `acceptedRate` lost update 버그도 해결), 최악의 핫 로우 경합 제거.

### Layer 5 — 대회/과제 기록 (정합성 필요)
순위·점수는 틀리면 안 되므로 트랜잭션을 유지하되:

- AMQP consumer 스레드에서 빼서 **배치 워커로 이동**.
- **`(contestId, userId)` 단위로 직렬화**(같은 유저의 동시 제출만 순서 보장, 다른 유저는 병렬). 인메모리 키 락 또는 파티션드 큐.
- `firstSolver`는 이미 try/catch지만 `ON CONFLICT DO NOTHING`(`createMany skipDuplicates`)로 명시.
- **라이브 리더보드 조회는 Redis Sorted Set**에서 서빙, PG 기록은 비동기 flush된 source of truth. 진행 중 대회의 순위 SELECT 폭주를 PG에서 분리.

## 4. 신뢰성 / 운영

- **멱등성**: finalize는 `submissionId` 키. `createMany skipDuplicates` 또는 `upsert`로 재처리 안전.
- **Backpressure**: AMQP `prefetch` 상한 + 워커 동시성 상한. 폭주 시 PG가 아니라 durable 큐에 쌓이게.
- **DLQ**: 현재 `throw → Nack → requeue`는 폭풍을 만든다. 재시도 N회 후 dead-letter로 격리.
- **PgBouncer**(transaction pooling)를 앞단에 둬 커넥션 폭증 흡수.
- **관측**: 큐 적체 길이, finalize 지연, flush 배치 크기, 핫 카운터 드리프트를 메트릭으로.

## 5. 단계적 적용 (효과/위험 순)

| 단계 | 내용 | 스키마 변경 | 기대 효과 |
|---|---|---|---|
| 1 | `updateSubmissionResult`를 매 메시지 → 제출 완료 시 1회로 (Redis 카운트로 완료 판정) | 없음 | 헛도는 조인 쿼리 ~98% 제거 |
| 2 | `submission_result` 개별 update → 배치(createMany/UNNEST) | 없음 | insert/update 라운드트립 급감 |
| 3 | 핫 카운터(problem/problem_testcase) Redis 누적 + 원자적 flush | 없음 | 핫 로우 경합 제거 + 정답률 버그 해결 |
| 4 | PgBouncer + AMQP prefetch/동시성 상한 + DLQ | 없음 | 커넥션 보호, 재처리 폭풍 차단 |
| 5 | 대회/과제 기록 배치 워커 이동 + (contestId,userId) 직렬화 | 없음 | 순위 갱신 경합 격리 |
| 6 | 리더보드 Redis Sorted Set 서빙 | 없음 | 진행 중 대회 읽기 폭주 분리 |

1~4단계만으로도 채점 폭주 시 PG 부하의 대부분이 사라진다.

## 6. 전용 워커 서비스 분리 + 2단계 샤딩

### 6.1 왜 전용 서비스인가
현재 consumer는 `client`(GraphQL API 서버) 안에 박혀 있다. 집계 처리량을 늘리려고 client를 스케일아웃하면 replica마다 Prisma 풀이 따로 열려 **PG 커넥션이 배수로 증가**하고, 같은 핫 로우를 두드리는 동시 writer가 늘어 **락 경합이 더 심해진다** — PG를 터뜨린 원인을 증폭시키는 셈. 따라서 채점 결과 처리(AMQP consumer + FinalizeWorker + CounterFlusher)를 **독립 배포 단위**(예: `apps/judge-consumer`)로 떼어 API와 별개로 스케일한다.

- `worker_threads`(별도 스레드): 병목이 DB 경합이지 JS CPU가 아니므로 효과 없음 → 채택 안 함.
- 서버리스: 장기 AMQP 구독·인메모리 마이크로 배치와 맞지 않고 커넥션 폭증을 유발 → 채택 안 함.
- **전용 장기 실행 워커 서비스**: 채택. 단 **replica 수가 아니라 배치 + 샤딩으로 확장**한다 — replica만 늘리면 같은 행을 두 워커가 동시에 건드려 락 경합이 되살아나기 때문.

### 6.2 핵심 원칙
**같이 써야 하는 행은 항상 한 워커에만, 서로 독립인 일은 여러 워커로.** 같은 행을 노리는 메시지를 키로 묶어 한 워커에 보내면 워커 안에서 순차 처리되어 안전하고, 워커 간에는 겹치는 행이 없어 병렬이 안전하다.

보호 단위가 둘이고 이상적 키가 다르다:

- **제출 단위 집계**: 한 제출의 케이스 N건이 흩어지면 완료 판정이 race → 키 `submissionId`
- **기록 갱신**: `contest_record`는 `(contestId, userId)` 단위 행이고 `updateContestRecord`가 그 유저의 모든 `contestProblemRecord`를 aggregate 재계산 → 동시 갱신 시 lost update → 키 `(contestId, userId)`

### 6.3 2단계 파이프라인 토폴로지

```
[Stage 1: 집계]                                  [Stage 2: 기록 갱신]
x-consistent-hash (key = submissionId)           x-consistent-hash (key = userId, 분산 주체)
        │                                                │
        ├─ q.agg.0 ─▶ aggWorker 0 ─┐                     ├─ q.rec.0 ─▶ recWorker 0 ─┐
        ├─ q.agg.1 ─▶ aggWorker 1 ─┼─ finalize 메시지 ─▶─┼─ q.rec.1 ─▶ recWorker 1 ─┼─▶ PG
        └─ q.agg.2 ─▶ aggWorker 2 ─┘   (재파티셔닝)       └─ q.rec.2 ─▶ recWorker 2 ─┘ (PgBouncer)
                  │                                                │
            Redis 버퍼                                    유저 단위 인메모리 키 락
       submission:{id}:results                          (같은 contestId:userId 직렬화)
```

- **Stage 1**: `submissionId`로 샤딩 → 한 제출의 케이스 50건이 한 워커에 모여 인메모리/Redis로 집계, 완료 시 finalize 메시지 1건을 Stage 2 익스체인지로 발행(**단계 사이 재파티셔닝**). Redis 버퍼를 공유로 쓰면 완료 판정은 원자적 `HINCRBY`라 이 샤딩은 성능 최적화 수준(필수 아님).
- **Stage 2**: `(contestId, userId)`로 샤딩 → 같은 유저 기록은 항상 같은 샤드라 **직렬화**되어 lost update 없음. 동시에 **다른 유저는 다른 샤드로 분산**되어 한 대회도 유저 수만큼 병렬. 이 샤딩은 정합성을 위해 **필수**.

### 6.4 키 선택 — 이 서비스의 운영 현실 반영
**대회는 사실상 한 번에 하나만 열린다.** 따라서 `contestId`는 활성 값이 1개뿐이라 샤딩 키로서 엔트로피가 0이다 — `contestId` 단독으로 샤딩하면 모든 메시지가 한 샤드로 몰려 분산이 전혀 안 된다(핫 샤드). 그러므로:

- **실질 분산은 `userId`가 담당한다.** `(contestId, userId)` 키에서 `contestId`는 "같은 대회 내 같은 유저"를 묶는 역할만 하고, 샤드를 가르는 엔트로피는 `userId`에서 나온다. 한 대회의 수백~수천 참가자가 `userId` 해시로 샤드에 고루 퍼지므로 분산은 충분하다. (단일 대회 한정이라면 키를 그냥 `userId`로 둬도 동치다. 추후 동시 다중 대회 가능성을 위해 `(contestId, userId)` 복합을 유지한다.)
- `submissionId` 단독 샤딩(Stage 1)은 부하는 고르지만 한 유저의 여러 제출이 여러 샤드로 흩어져 그 유저의 `contest_record`를 동시 갱신할 수 있다 → 그래서 Stage 2를 `userId`로 **재파티셔닝**해 유저 단위 직렬화를 보장한다. 이것이 단계 분리의 핵심 이유다.
- 결론: **단계를 분리하고 Stage 2를 `userId`(=`(contestId, userId)`)로** 잡으면, 단일 대회 환경에서도 직렬화(정합성)와 분산(부하)을 동시에 얻는다.

- `contest_problem_first_solver`(공유 행)는 `ON CONFLICT DO NOTHING` insert라 샤딩 없이도 안전.
- 핫 카운터 flush(`problem`/`problem_testcase`)는 별개 — 단일 CounterFlusher가 Redis 누적 델타를 원자적 SQL 증분으로 반영하므로 샤딩 불필요(필요 시 `problemId`로 분할).

### 6.5 운영 시 함정
- **스큐**: 키 분포가 치우치면 핫 샤드. `(contestId, userId)`는 분포가 고와 안전한 편.
- **리밸런싱**: 워커 추가/제거 시 해시 링이 일부 키를 옮기며, 그 순간 같은 키가 잠깐 두 워커에 걸칠 수 있음 → 기록 트랜잭션은 **멱등 + DB unique 제약**으로 방어(이미 `@@unique` 다수 존재).
- **순서**: 같은 샤드 안에서도 케이스 순서는 보장 안 되지만 집계는 순서 무관(전부 모이면 됨)이라 문제 없음.

## 7. 핵심 코드 변경 지점

- `apps/backend/apps/client/src/submission/submission-sub.service.ts`
  - `handleJudgerMessage` / `updateTestcaseJudgeResult`: 동기 DB 쓰기 → Redis 버퍼 적재 + 즉시 ack
  - `updateSubmissionResult`: 매 메시지 호출 제거, finalize 워커에서 1회
  - `updateProblemAccepted` / `updateTestcaseStats`: Redis 델타 누적으로 대체
- 신규: `FinalizeWorker`(배치 드레인 + 트랜잭션 기록), `CounterFlusher`(스케줄러)
- `apps/backend/libs/amqp`: prefetch/동시성/DLQ 설정
- (선택) `apps/iris/src/handler/judge-handler.go`: 영속화용 집계 메시지 1건 추가 발행
- 신규: `apps/judge-consumer` — consumer + FinalizeWorker + CounterFlusher를 담는 독립 배포 서비스
- 인프라: PgBouncer, Redis(이미 있음) 활용
