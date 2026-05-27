#!/usr/bin/env ts-node
/**
 * E2E test for iris polygon tools (generate / validate).
 * Runs one scenario at a time against the existing judge queue.
 *
 * Prerequisites:
 *   - docker-compose up rabbitmq database
 *   - init-rabbitmq.ts already executed
 *   - iris running (devcontainer, libjudger.so required)
 *
 * Usage:
 *   pnpm e2e:polygon G1
 *   pnpm e2e:polygon G1 G2 V1
 *   pnpm e2e:polygon --all
 *
 * Note: testcaseCount=1 is used throughout because the judger sandbox
 *       does not support concurrent execution on the same BuildUnit.
 *       (concurrent runs cause "mkdir: File exists" in cgroup creation)
 */
import * as amqplib from 'amqplib'
import { Client } from 'pg'

// ---------------------------------------------------------------------------
// Config (from .envrc)
// ---------------------------------------------------------------------------

const RMQ_HOST = process.env.RABBITMQ_HOST ?? '127.0.0.1'
const RMQ_PORT = parseInt(process.env.RABBITMQ_PORT ?? '5672')
const RMQ_USER = process.env.RABBITMQ_DEFAULT_USER ?? 'skku'
const RMQ_PASS = process.env.RABBITMQ_DEFAULT_PASS ?? '1234'
const RMQ_VHOST = process.env.RABBITMQ_DEFAULT_VHOST ?? 'vh'
const SUB_QUEUE =
  process.env.JUDGE_SUBMISSION_QUEUE_NAME ?? 'client.q.judge.submission'
const RES_QUEUE = process.env.JUDGE_RESULT_QUEUE_NAME ?? 'iris.q.judge.result'
const DB_URL = (
  process.env.DATABASE_URL ??
  'postgresql://postgres:1234@127.0.0.1:5433/skkuding'
).split('?')[0]

const TIMEOUT_MS = 30_000

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PolygonToolResponse {
  messageId: string
  problemId: number
  toolType: string
  resultCode: number
  toolResult: GenerateToolResult | ValidateToolResult | null
  error: string
}

interface GenerateToolResult {
  generatedCount: number
  requestedCount: number
  errors: Array<{ index: number; message: string; stderr?: string }> | null
}

interface ValidateToolResult {
  isAllValid: boolean
  testcaseCount: number
  results: Array<{
    testcaseId: number
    isValid: boolean
    message?: string
    stderr?: string
  }>
}

// problemIds created at setup, deleted at teardown
interface TestContext {
  pid1: number // G1 (saves testcase), then V1 (validates)
  pid2: number // G2 (saves testcase with output)
  pid3: number // V2 (seeded: 1 valid + 1 invalid)
}

type Scenario = (
  ch: amqplib.Channel,
  db: Client,
  ctx: TestContext
) => Promise<boolean>

// ---------------------------------------------------------------------------
// RabbitMQ helpers
// ---------------------------------------------------------------------------

function publish(
  ch: amqplib.Channel,
  msgType: string,
  messageId: string,
  body: object
): void {
  ch.sendToQueue(SUB_QUEUE, Buffer.from(JSON.stringify(body)), {
    messageId,
    type: msgType,
    contentType: 'application/json',
    deliveryMode: 2
  })
}

async function waitForResponse(
  ch: amqplib.Channel,
  messageId: string
): Promise<PolygonToolResponse> {
  const deadline = Date.now() + TIMEOUT_MS
  while (Date.now() < deadline) {
    const msg = await ch.get(RES_QUEUE, { noAck: false })
    if (!msg) {
      await sleep(300)
      continue
    }
    const resp = JSON.parse(msg.content.toString()) as PolygonToolResponse
    if (resp.messageId === messageId) {
      ch.ack(msg)
      return resp
    }
    // stale message from a previous run — consume and discard
    ch.ack(msg)
    console.log(`  [warn] discarded stale messageId=${resp.messageId}`)
  }
  throw new Error(
    `Timeout: no response for ${messageId} in ${TIMEOUT_MS / 1000}s`
  )
}

// ---------------------------------------------------------------------------
// DB helpers
// ---------------------------------------------------------------------------

async function setupProblems(db: Client): Promise<TestContext> {
  async function createOne(): Promise<number> {
    const res = await db.query<{ id: number }>(`
      INSERT INTO problem (
        title, description, input_description, output_description, hint,
        time_limit, memory_limit, difficulty, source,
        visible_lock_time, create_time, update_time
      ) VALUES (
        'e2e-test', '', '', '', '',
        1000, 256, 'Level1', 'e2e',
        '1970-01-01', NOW(), NOW()
      ) RETURNING id
    `)
    return res.rows[0].id
  }
  const pid1 = await createOne()
  const pid2 = await createOne()
  const pid3 = await createOne()
  console.log(
    `  Test problems created: pid1=${pid1}, pid2=${pid2}, pid3=${pid3}`
  )
  return { pid1, pid2, pid3 }
}

async function teardownProblems(db: Client, ctx: TestContext): Promise<void> {
  // ON DELETE CASCADE removes problem_testcase rows automatically
  await db.query('DELETE FROM problem WHERE id = ANY($1)', [
    [ctx.pid1, ctx.pid2, ctx.pid3]
  ])
  console.log(`  Test problems deleted: ${ctx.pid1}, ${ctx.pid2}, ${ctx.pid3}`)
}

async function dbCountTestcases(
  db: Client,
  problemId: number
): Promise<number> {
  const res = await db.query<{ count: string }>(
    'SELECT count(*)::int AS count FROM problem_testcase WHERE problem_id = $1 AND is_outdated = false',
    [problemId]
  )
  return parseInt(res.rows[0].count)
}

async function dbSeedTestcases(
  db: Client,
  problemId: number,
  rows: Array<[string, string, boolean]>
): Promise<void> {
  for (const [input, output, isHidden] of rows) {
    await db.query(
      `INSERT INTO problem_testcase (problem_id, input, output, is_hidden_testcase, update_time)
       VALUES ($1, $2, $3, $4, NOW())`,
      [problemId, input, output, isHidden]
    )
  }
}

// ---------------------------------------------------------------------------
// Assertion helpers
// ---------------------------------------------------------------------------

interface CheckResult {
  label: string
  ok: boolean
  actual: unknown
  expected?: unknown
}

function check(label: string, actual: unknown, expected: unknown): CheckResult {
  return { label, ok: actual === expected, actual, expected }
}

function checkNonEmpty(label: string, actual: unknown): CheckResult {
  const ok =
    actual !== null && actual !== undefined && actual !== '' && actual !== 0
  return { label, ok, actual }
}

function printChecks(results: CheckResult[]): boolean {
  let allOk = true
  for (const r of results) {
    if (r.ok) {
      console.log(`  [OK]   ${r.label}: ${JSON.stringify(r.actual)}`)
    } else {
      console.log(
        `  [FAIL] ${r.label}: expected=${JSON.stringify(r.expected)}, got=${JSON.stringify(r.actual)}`
      )
      allOk = false
    }
  }
  return allOk
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

function elapsed(t0: number): string {
  return `${((Date.now() - t0) / 1000).toFixed(1)}s`
}

// ---------------------------------------------------------------------------
// Code fixtures
// ---------------------------------------------------------------------------

// generator: always outputs "3 5" (valid for 1≤a,b≤1000)
const C_GEN_VALID = '#include <stdio.h>\nint main(){printf("3 5\\n");return 0;}'

// generator: always exits with code 1
const C_GEN_FAIL = '#include <stdlib.h>\nint main(){exit(1);}'

// solution: reads "a b", outputs "a+b"
const C_SOL_ADD =
  '#include <stdio.h>\nint main(){int a,b;scanf("%d %d",&a,&b);printf("%d\\n",a+b);return 0;}'

// validator: accepts input if 1≤a,b≤1000
const C_VAL_RANGE =
  '#include <stdio.h>\nint main(){int a,b;if(scanf("%d %d",&a,&b)!=2)return 1;if(a<1||a>1000||b<1||b>1000)return 1;return 0;}'

// ---------------------------------------------------------------------------
// Scenarios — Generate
// ---------------------------------------------------------------------------

async function G1(
  ch: amqplib.Channel,
  db: Client,
  ctx: TestContext
): Promise<boolean> {
  publish(ch, 'generate', 'e2e-gen-001', {
    problemId: ctx.pid1,
    generatorLanguage: 'C',
    generatorCode: C_GEN_VALID,
    testcaseCount: 1
  })
  console.log(`  Waiting up to ${TIMEOUT_MS / 1000}s...`)
  const t0 = Date.now()
  const resp = await waitForResponse(ch, 'e2e-gen-001')
  console.log(`  Response received (${elapsed(t0)})`)

  const tool = resp.toolResult as GenerateToolResult | null
  return printChecks([
    check('toolType', resp.toolType, 'generator'),
    check('resultCode', resp.resultCode, 0),
    check('error', resp.error, ''),
    check('generatedCount', tool?.generatedCount, 1),
    check('requestedCount', tool?.requestedCount, 1),
    check('DB rows', await dbCountTestcases(db, ctx.pid1), 1)
  ])
}

async function G2(
  ch: amqplib.Channel,
  db: Client,
  ctx: TestContext
): Promise<boolean> {
  publish(ch, 'generate', 'e2e-gen-002', {
    problemId: ctx.pid2,
    generatorLanguage: 'C',
    generatorCode: C_GEN_VALID,
    solutionLanguage: 'C',
    solutionCode: C_SOL_ADD,
    testcaseCount: 1
  })
  console.log(`  Waiting up to ${TIMEOUT_MS / 1000}s...`)
  const t0 = Date.now()
  const resp = await waitForResponse(ch, 'e2e-gen-002')
  console.log(`  Response received (${elapsed(t0)})`)

  const tool = resp.toolResult as GenerateToolResult | null
  const dbRows = await dbCountTestcases(db, ctx.pid2)
  const checks: CheckResult[] = [
    check('toolType', resp.toolType, 'generator'),
    check('resultCode', resp.resultCode, 0),
    check('generatedCount', tool?.generatedCount, 1),
    check('DB rows', dbRows, 1)
  ]

  if (dbRows > 0) {
    const res = await db.query<{ output: string }>(
      'SELECT output FROM problem_testcase WHERE problem_id = $1 AND is_outdated = false',
      [ctx.pid2]
    )
    const hasOutput = res.rows.every((r) => r.output.trim() !== '')
    checks.push(check('output non-empty', hasOutput, true))
  }

  return printChecks(checks)
}

async function G3(
  ch: amqplib.Channel,
  _db: Client,
  _ctx: TestContext
): Promise<boolean> {
  publish(ch, 'generate', 'e2e-gen-003', {
    problemId: 99999,
    generatorLanguage: 'C',
    generatorCode: 'this is not valid C!!!',
    testcaseCount: 1
  })
  console.log(`  Waiting up to ${TIMEOUT_MS / 1000}s...`)
  const t0 = Date.now()
  const resp = await waitForResponse(ch, 'e2e-gen-003')
  console.log(`  Response received (${elapsed(t0)})`)

  return printChecks([
    check('toolType', resp.toolType, 'generator'),
    check('resultCode', resp.resultCode, 6), // COMPILE_ERROR
    check('toolResult', resp.toolResult, null),
    checkNonEmpty('error (compile output)', resp.error)
  ])
}

async function G4(
  ch: amqplib.Channel,
  _db: Client,
  _ctx: TestContext
): Promise<boolean> {
  publish(ch, 'generate', 'e2e-gen-004', {
    problemId: 99999,
    generatorLanguage: 'C',
    generatorCode: C_GEN_FAIL,
    testcaseCount: 1
  })
  console.log(`  Waiting up to ${TIMEOUT_MS / 1000}s...`)
  const t0 = Date.now()
  const resp = await waitForResponse(ch, 'e2e-gen-004')
  console.log(`  Response received (${elapsed(t0)})`)

  const tool = resp.toolResult as GenerateToolResult | null
  return printChecks([
    check('toolType', resp.toolType, 'generator'),
    check('resultCode', resp.resultCode, 9), // SERVER_ERROR
    check('generatedCount', tool?.generatedCount, 0),
    check('requestedCount', tool?.requestedCount, 1),
    check('errors length', tool?.errors?.length, 1)
  ])
}

async function G5(
  ch: amqplib.Channel,
  _db: Client,
  _ctx: TestContext
): Promise<boolean> {
  publish(ch, 'generate', 'e2e-gen-005', {
    problemId: 99999,
    generatorLanguage: 'C',
    // generatorCode omitted intentionally
    testcaseCount: 1
  })
  console.log(`  Waiting up to ${TIMEOUT_MS / 1000}s...`)
  const t0 = Date.now()
  const resp = await waitForResponse(ch, 'e2e-gen-005')
  console.log(`  Response received (${elapsed(t0)})`)

  return printChecks([
    check('toolType', resp.toolType, 'generator'),
    check('resultCode', resp.resultCode, 9), // SERVER_ERROR
    check('toolResult', resp.toolResult, null)
  ])
}

// ---------------------------------------------------------------------------
// Scenarios — Validate
// ---------------------------------------------------------------------------

async function V1(
  ch: amqplib.Channel,
  db: Client,
  ctx: TestContext
): Promise<boolean> {
  let dbRows = await dbCountTestcases(db, ctx.pid1)
  if (dbRows === 0) {
    await dbSeedTestcases(db, ctx.pid1, [['3 5', '', false]])
    dbRows = 1
    console.log(`  Seeded 1 testcase for pid1=${ctx.pid1}`)
  } else {
    console.log(`  Reusing ${dbRows} testcase(s) from G1 in pid1=${ctx.pid1}`)
  }

  publish(ch, 'validate', 'e2e-val-001', {
    problemId: ctx.pid1,
    language: 'C',
    validatorCode: C_VAL_RANGE
  })
  console.log(`  Waiting up to ${TIMEOUT_MS / 1000}s...`)
  const t0 = Date.now()
  const resp = await waitForResponse(ch, 'e2e-val-001')
  console.log(`  Response received (${elapsed(t0)})`)

  const tool = resp.toolResult as ValidateToolResult | null
  const allResultsValid = tool?.results?.every((r) => r.isValid) ?? false

  return printChecks([
    check('toolType', resp.toolType, 'validator'),
    check('resultCode', resp.resultCode, 0),
    check('error', resp.error, ''),
    check('isAllValid', tool?.isAllValid, true),
    check('testcaseCount', tool?.testcaseCount, dbRows),
    check('all isValid', allResultsValid, true)
  ])
}

async function V2(
  ch: amqplib.Channel,
  db: Client,
  ctx: TestContext
): Promise<boolean> {
  await dbSeedTestcases(db, ctx.pid3, [
    ['5 10', '15', false], // valid: 1≤a,b≤1000
    ['0 5', '5', false] // invalid: a=0
  ])
  console.log(`  Seeded 2 testcases for pid3=${ctx.pid3}`)

  publish(ch, 'validate', 'e2e-val-002', {
    problemId: ctx.pid3,
    language: 'C',
    validatorCode: C_VAL_RANGE
  })
  console.log(`  Waiting up to ${TIMEOUT_MS / 1000}s...`)
  const t0 = Date.now()
  const resp = await waitForResponse(ch, 'e2e-val-002')
  console.log(`  Response received (${elapsed(t0)})`)

  const tool = resp.toolResult as ValidateToolResult | null
  const validCount = tool?.results?.filter((r) => r.isValid).length ?? -1
  const invalidCount = tool?.results?.filter((r) => !r.isValid).length ?? -1

  return printChecks([
    check('toolType', resp.toolType, 'validator'),
    check('resultCode', resp.resultCode, 0),
    check('isAllValid', tool?.isAllValid, false),
    check('testcaseCount', tool?.testcaseCount, 2),
    check('valid count', validCount, 1),
    check('invalid count', invalidCount, 1)
  ])
}

async function V3(
  ch: amqplib.Channel,
  _db: Client,
  _ctx: TestContext
): Promise<boolean> {
  // Use a problem_id that has no testcases in DB or S3
  // No FK issue here: GetTestcase only SELECTs from problem_testcase, no INSERT
  publish(ch, 'validate', 'e2e-val-003', {
    problemId: 999999999,
    language: 'C',
    validatorCode: '#include <stdio.h>\nint main(){return 0;}'
  })
  console.log(`  Waiting up to ${TIMEOUT_MS / 1000}s...`)
  const t0 = Date.now()
  const resp = await waitForResponse(ch, 'e2e-val-003')
  console.log(`  Response received (${elapsed(t0)})`)

  return printChecks([
    check('toolType', resp.toolType, 'validator'),
    check('resultCode', resp.resultCode, 7), // TESTCASE_ERROR
    check('toolResult', resp.toolResult, null)
  ])
}

async function V4(
  ch: amqplib.Channel,
  _db: Client,
  ctx: TestContext
): Promise<boolean> {
  publish(ch, 'validate', 'e2e-val-004', {
    problemId: ctx.pid1,
    language: 'C'
    // validatorCode omitted intentionally
  })
  console.log(`  Waiting up to ${TIMEOUT_MS / 1000}s...`)
  const t0 = Date.now()
  const resp = await waitForResponse(ch, 'e2e-val-004')
  console.log(`  Response received (${elapsed(t0)})`)

  return printChecks([
    check('toolType', resp.toolType, 'validator'),
    check('resultCode', resp.resultCode, 9), // SERVER_ERROR
    check('toolResult', resp.toolResult, null)
  ])
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

const SCENARIOS: Record<string, Scenario> = {
  G1,
  G2,
  G3,
  G4,
  G5,
  V1,
  V2,
  V3,
  V4
}

const DESCRIPTIONS: Record<string, string> = {
  G1: 'Generate — 정상 (솔루션 없음, testcaseCount=1)',
  G2: 'Generate — 정상 (솔루션 포함, output 생성 확인)',
  G3: 'Generate — 컴파일 에러',
  G4: 'Generate — 런타임 전체 실패 (exit 1)',
  G5: 'Generate — invalid request (generatorCode 누락)',
  V1: 'Validate — 전체 유효 (G1 testcase 또는 seeded)',
  V2: 'Validate — 일부 무효 (a=0 range violation)',
  V3: 'Validate — testcase 없음 (TESTCASE_ERROR)',
  V4: 'Validate — invalid request (validatorCode 누락)'
}

async function runScenario(
  name: string,
  fn: Scenario,
  ch: amqplib.Channel,
  db: Client,
  ctx: TestContext
): Promise<boolean> {
  const SEP = '='.repeat(60)
  console.log(`\n${SEP}`)
  console.log(`[${name}] ${DESCRIPTIONS[name]}`)
  console.log(SEP)
  try {
    const ok = await fn(ch, db, ctx)
    console.log(ok ? '>> PASSED' : '>> FAILED')
    return ok
  } catch (e) {
    console.log(`  [ERROR] ${e instanceof Error ? e.message : String(e)}`)
    console.log('>> FAILED')
    return false
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const runAll = args.includes('--all') || args.length === 0
  const names = runAll ? Object.keys(SCENARIOS) : args

  const invalid = names.filter((n) => !(n in SCENARIOS))
  if (invalid.length) {
    console.error(`Unknown scenarios: ${invalid.join(', ')}`)
    console.error(`Available: ${Object.keys(SCENARIOS).join(', ')}`)
    process.exit(1)
  }

  const rmqUrl = `amqp://${RMQ_USER}:${encodeURIComponent(RMQ_PASS)}@${RMQ_HOST}:${RMQ_PORT}/${encodeURIComponent(RMQ_VHOST)}`
  console.log(`Connecting RabbitMQ: ${RMQ_HOST}:${RMQ_PORT}/${RMQ_VHOST}`)
  const rmqConn = await amqplib.connect(rmqUrl)
  const ch = await rmqConn.createChannel()

  console.log(`Connecting DB: ${DB_URL.replace(/:([^:@]+)@/, ':****@')}`)
  const db = new Client({ connectionString: DB_URL })
  await db.connect()

  console.log('\nSetting up test problems in DB...')
  const ctx = await setupProblems(db)

  const passed: string[] = []
  const failed: string[] = []

  try {
    for (const name of names) {
      const ok = await runScenario(name, SCENARIOS[name], ch, db, ctx)
      if (ok) passed.push(name)
      else failed.push(name)
    }
  } finally {
    console.log('\nCleaning up test problems...')
    await teardownProblems(db, ctx)
    await ch.close()
    await rmqConn.close()
    await db.end()
  }

  const SEP = '='.repeat(60)
  console.log(`\n${SEP}`)
  console.log(`Results: ${passed.length} passed, ${failed.length} failed`)
  if (passed.length) console.log(`  Passed: ${passed.join(', ')}`)
  if (failed.length) console.log(`  Failed: ${failed.join(', ')}`)
  console.log(SEP)

  process.exit(failed.length > 0 ? 1 : 0)
}

main().catch((e) => {
  console.error('Fatal:', e)
  process.exit(1)
})
