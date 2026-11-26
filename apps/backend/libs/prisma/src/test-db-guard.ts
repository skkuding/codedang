/**
 * 자동화 테스트가 로컬 개발 DB에 연결하거나 개발 DB를 초기화하지 못하도록 막는 검사입니다.
 *
 * 이 모듈은 `@prisma/client`, Nest 등 무거운 의존성을 import하지 않아야 합니다.
 * `@prisma/client`는 import 시점에 `.env`를 `process.env`에 주입하므로,
 * 이 검사는 반드시 그보다 먼저(mocha의 `require` 단계, pretest 스크립트) 실행되어야 합니다.
 *
 * 오류 메시지에는 DB URL, 계정, 비밀번호를 포함하지 않습니다.
 */
import { parse } from 'dotenv'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

/** `apps/backend/.env`의 위치 (이 파일 기준 상대 경로) */
const DEVELOPMENT_ENV_FILE = join(__dirname, '..', '..', '..', '.env')

/**
 * 로컬 개발 DB 기준값(`apps/backend/.env`의 DATABASE_URL)이 없는 환경에서
 * 테스트 DB가 전용·일회용임을 명시하는 환경변수입니다. (예: CI)
 */
const ISOLATED_FLAG = 'TEST_DATABASE_ISOLATED'

const DEFAULT_POSTGRES_PORT = 5432

export class TestDatabaseGuardError extends Error {
  constructor(message: string) {
    super(`Refusing to run tests: ${message}`)
    this.name = 'TestDatabaseGuardError'
  }
}

export interface DatabaseTarget {
  host: string
  port: number
  database: string
}

// 0.0.0.0, ::도 접속 대상으로 쓰면 로컬 서버에 연결되므로 루프백으로 취급합니다.
const isLoopbackHost = (host: string) =>
  host === 'localhost' ||
  host === '::1' ||
  host === '::' ||
  host === '0.0.0.0' ||
  (CANONICAL_IPV4.test(host) && host.startsWith('127.'))

const CANONICAL_IPV4 =
  /^((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/
const NUMERIC_HOST_LABELS = /^(0x[0-9a-f]*|\d+)(\.(0x[0-9a-f]*|\d+))*$/

/**
 * 호스트 표기를 정규화합니다. 같은 주소를 여러 방식으로 적을 수 있는 표기는 대상을 확정할 수 없으므로 거부합니다.
 * Prisma는 `127.1`, `2130706433`, `0x7f000001`, `::ffff:127.0.0.1` 같은 표기도 루프백으로 해석해 접속합니다.
 */
const normalizeHost = (hostname: string, name: string) => {
  const host = hostname
    .replace(/^\[|\]$/g, '')
    .toLowerCase()
    .replace(/\.$/, '')

  const isNonCanonicalIPv4 =
    NUMERIC_HOST_LABELS.test(host) && !CANONICAL_IPV4.test(host)
  if (isNonCanonicalIPv4 || host.startsWith('::ffff:')) {
    throw new TestDatabaseGuardError(
      `${name} uses a non-canonical IP address, so the target cannot be verified. Use a dotted IPv4 address (e.g. 127.0.0.1) or a host name.`
    )
  }

  return isLoopbackHost(host) ? 'loopback' : host
}

/**
 * PostgreSQL 연결 URL에서 연결 대상(호스트, 포트, DB 이름)을 추출합니다.
 * 대상을 확정할 수 없으면 예외를 던집니다. (fail-closed)
 *
 * @param url 검사할 URL
 * @param name 오류 메시지에 표시할 환경변수 이름 (URL 값은 표시하지 않음)
 */
export const parseDatabaseTarget = (
  url: string | undefined,
  name: string
): DatabaseTarget => {
  if (!url || !url.trim()) {
    throw new TestDatabaseGuardError(`${name} is not set.`)
  }

  let parsed: URL
  try {
    parsed = new URL(url.trim())
  } catch {
    throw new TestDatabaseGuardError(`${name} is not a valid URL.`)
  }

  if (parsed.protocol !== 'postgresql:' && parsed.protocol !== 'postgres:') {
    throw new TestDatabaseGuardError(`${name} is not a PostgreSQL URL.`)
  }

  // 소켓 경로 등으로 실제 접속 대상을 덮어쓰는 형식은 대상을 확정할 수 없으므로 거부합니다.
  if (parsed.searchParams.has('host')) {
    throw new TestDatabaseGuardError(
      `${name} overrides the host with a query parameter, so the target cannot be verified.`
    )
  }

  if (!parsed.hostname) {
    throw new TestDatabaseGuardError(`${name} has no host.`)
  }
  const host = normalizeHost(parsed.hostname, name)

  const port = parsed.port ? Number(parsed.port) : DEFAULT_POSTGRES_PORT
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new TestDatabaseGuardError(`${name} has an invalid port.`)
  }

  // Prisma는 DB 이름을 percent-decoding하지 않고 경로 그대로 사용하므로,
  // 인코딩된 DB 이름은 같은 DB를 다르게 표현할 수 있어 대상을 확정할 수 없는 것으로 보고 거부합니다.
  const database = parsed.pathname.replace(/^\//, '')
  if (database.includes('%')) {
    throw new TestDatabaseGuardError(
      `${name} has a percent-encoded database name, so the target cannot be verified.`
    )
  }
  if (!database || database.includes('/')) {
    throw new TestDatabaseGuardError(`${name} has no database name.`)
  }

  return {
    host,
    port,
    database
  }
}

/**
 * 두 연결 대상이 같은 DB를 가리키는지 비교합니다.
 *
 * 로컬 주소(`localhost`, `127.0.0.1`, `::1` 등)는 같은 호스트로 취급합니다.
 * 스키마(`?schema=`)는 비교하지 않으므로, 같은 DB의 다른 스키마도 같은 대상으로 판단합니다.
 * 서로 다른 호스트 이름이 실제로 같은 서버를 가리키는 경우(DNS 별칭, 포트 포워딩)는 판별할 수 없습니다.
 */
export const isSameDatabaseTarget = (a: DatabaseTarget, b: DatabaseTarget) =>
  a.host === b.host && a.port === b.port && a.database === b.database

/**
 * 로컬 개발 DB의 URL을 `.env` 파일에서 읽습니다.
 * 파일 내용을 `process.env`에 주입하지 않습니다.
 *
 * @returns 파일이나 DATABASE_URL 항목이 없으면 undefined
 */
export const readDevelopmentDatabaseUrl = (
  envFile: string = DEVELOPMENT_ENV_FILE
): string | undefined => {
  if (!existsSync(envFile)) {
    return undefined
  }
  const value = parse(readFileSync(envFile)).DATABASE_URL
  return value?.trim() ? value : undefined
}

export type TestDatabaseGuardMode =
  /** `prisma migrate reset` 실행 전: TEST_DATABASE_URL만 검사 */
  | 'reset'
  /** 테스트 코드가 DB에 연결하기 전: DATABASE_URL도 테스트 DB를 가리켜야 함 */
  | 'connect'

/**
 * 테스트가 사용할 DB가 안전한지 검사합니다. 안전하지 않으면 예외를 던집니다.
 *
 * 1. TEST_DATABASE_URL이 있고 PostgreSQL 연결 대상을 확정할 수 있어야 합니다.
 * 2. (connect) DATABASE_URL이 TEST_DATABASE_URL과 같은 DB를 가리켜야 합니다.
 * 3. 로컬 개발 DB(`apps/backend/.env`의 DATABASE_URL)가 있으면, 테스트 DB는 그와 달라야 합니다.
 * 4. 로컬 개발 DB 기준값이 없으면 `TEST_DATABASE_ISOLATED=true`가 명시되어야 합니다.
 *
 * @returns 검사를 통과한 테스트 DB 연결 대상
 */
export const assertSafeTestDatabase = ({
  mode,
  env,
  developmentDatabaseUrl
}: {
  mode: TestDatabaseGuardMode
  env: NodeJS.ProcessEnv
  developmentDatabaseUrl: string | undefined
}): DatabaseTarget => {
  const testTarget = parseDatabaseTarget(
    env.TEST_DATABASE_URL,
    'TEST_DATABASE_URL'
  )

  if (mode === 'connect') {
    const connectTarget = parseDatabaseTarget(env.DATABASE_URL, 'DATABASE_URL')
    if (!isSameDatabaseTarget(connectTarget, testTarget)) {
      throw new TestDatabaseGuardError(
        'DATABASE_URL and TEST_DATABASE_URL point to different databases. ' +
          'Run tests with `pnpm test`, or set DATABASE_URL to the test database.'
      )
    }
  }

  if (developmentDatabaseUrl === undefined) {
    if (env[ISOLATED_FLAG] !== 'true') {
      throw new TestDatabaseGuardError(
        'cannot find the local development DATABASE_URL in apps/backend/.env to compare against. ' +
          `Set ${ISOLATED_FLAG}=true only where the test database is dedicated and disposable (e.g. CI).`
      )
    }
    return testTarget
  }

  const developmentTarget = parseDatabaseTarget(
    developmentDatabaseUrl,
    'DATABASE_URL in apps/backend/.env'
  )
  if (isSameDatabaseTarget(testTarget, developmentTarget)) {
    throw new TestDatabaseGuardError(
      'TEST_DATABASE_URL points to the local development database ' +
        '(DATABASE_URL in apps/backend/.env).'
    )
  }

  return testTarget
}

/**
 * 현재 프로세스 환경과 `apps/backend/.env`를 기준으로 검사를 실행합니다.
 */
export const runTestDatabaseGuard = (
  mode: TestDatabaseGuardMode,
  env: NodeJS.ProcessEnv = process.env
) =>
  assertSafeTestDatabase({
    mode,
    env,
    developmentDatabaseUrl: readDevelopmentDatabaseUrl()
  })
