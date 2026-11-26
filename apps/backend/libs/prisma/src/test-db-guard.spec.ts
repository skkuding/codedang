/* eslint-disable @typescript-eslint/naming-convention -- 환경변수 이름(TEST_DATABASE_URL 등)을 그대로 키로 사용 */
import { expect } from 'chai'
import { mkdtempSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import {
  assertSafeTestDatabase,
  isSameDatabaseTarget,
  parseDatabaseTarget,
  readDevelopmentDatabaseUrl,
  TestDatabaseGuardError
} from './test-db-guard'

// 실제 DB에 연결하지 않는 순수 검사이므로 모든 URL은 가짜 값입니다.
const DEV_URL =
  'postgresql://dev-user:dev-secret@127.0.0.1:5433/skkuding?schema=public'
const TEST_URL =
  'postgresql://test-user:test-secret@127.0.0.1:5434/skkuding?schema=public'
const CI_URL =
  'postgresql://ci-user:ci-secret@localhost:5432/skkuding?schema=public'

/** `apps/backend/.env`가 없는 환경(CI)을 나타냅니다. */
const NO_DEV_ENV = Symbol('no development .env')

const guard =
  (
    mode: 'reset' | 'connect',
    env: NodeJS.ProcessEnv,
    development: string | typeof NO_DEV_ENV = DEV_URL
  ) =>
  () =>
    assertSafeTestDatabase({
      mode,
      env,
      developmentDatabaseUrl:
        development === NO_DEV_ENV ? undefined : development
    })

describe('test-db-guard', () => {
  describe('parseDatabaseTarget', () => {
    it('should extract host, port and database', () => {
      expect(parseDatabaseTarget(TEST_URL, 'X')).to.deep.equal({
        host: 'loopback',
        port: 5434,
        database: 'skkuding'
      })
    })

    it('should accept postgres:// and default the port to 5432', () => {
      expect(
        parseDatabaseTarget('postgres://u@db.internal/app', 'X')
      ).to.deep.equal({
        host: 'db.internal',
        port: 5432,
        database: 'app'
      })
    })

    for (const host of [
      'localhost',
      '127.0.0.1',
      '127.1.2.3',
      '[::1]',
      '[0:0:0:0:0:0:0:1]',
      '[::]',
      '0.0.0.0',
      'localhost.'
    ]) {
      it(`should normalize ${host} as a loopback host`, () => {
        expect(
          parseDatabaseTarget(`postgresql://u@${host}:5434/skkuding`, 'X').host
        ).to.equal('loopback')
      })
    }

    const invalid: [string, string | undefined][] = [
      ['undefined', undefined],
      ['empty', ''],
      ['blank', '   '],
      ['not a URL', 'not-a-url'],
      ['non-PostgreSQL protocol', 'mysql://u@127.0.0.1:3306/skkuding'],
      ['missing host', 'postgresql://u@/skkuding'],
      ['missing database', 'postgresql://u@127.0.0.1:5434'],
      ['missing database (slash only)', 'postgresql://u@127.0.0.1:5434/'],
      [
        'host override by query',
        'postgresql://u@127.0.0.1:5434/skkuding?host=/tmp'
      ],
      ['nested database path', 'postgresql://u@127.0.0.1:5434/a/b'],
      ['port 0', 'postgresql://u@127.0.0.1:0/skkuding'],
      ['port out of range', 'postgresql://u@127.0.0.1:65536/skkuding'],
      // Prisma가 루프백으로 해석해 접속하는 비정규 IP 표기 (대상 확정 불가)
      ['shorthand IPv4 (127.1)', 'postgresql://u@127.1:5433/skkuding'],
      ['decimal IPv4', 'postgresql://u@2130706433:5433/skkuding'],
      ['hex IPv4', 'postgresql://u@0x7f000001:5433/skkuding'],
      ['zero-padded IPv4', 'postgresql://u@127.000.000.001:5433/skkuding'],
      ['IPv4-mapped IPv6', 'postgresql://u@[::ffff:127.0.0.1]:5433/skkuding']
    ]
    for (const [label, url] of invalid) {
      it(`should reject ${label}`, () => {
        expect(() => parseDatabaseTarget(url, 'TEST_DATABASE_URL')).to.throw(
          TestDatabaseGuardError
        )
      })
    }
  })

  describe('isSameDatabaseTarget', () => {
    const target = (url: string) => parseDatabaseTarget(url, 'X')

    it('should treat localhost and 127.0.0.1 as the same host', () => {
      expect(
        isSameDatabaseTarget(
          target('postgresql://a:1@localhost:5433/skkuding'),
          target('postgres://b:2@127.0.0.1:5433/skkuding?schema=public')
        )
      ).to.be.true
    })

    it('should ignore credentials, query parameters and schema', () => {
      expect(
        isSameDatabaseTarget(
          target('postgresql://a:1@127.0.0.1:5433/skkuding?schema=public'),
          target(
            'postgresql://b:2@127.0.0.1:5433/skkuding?schema=other&sslmode=disable'
          )
        )
      ).to.be.true
    })

    it('should distinguish ports, databases and hosts', () => {
      const base = target(DEV_URL)
      expect(isSameDatabaseTarget(base, target(TEST_URL))).to.be.false
      expect(
        isSameDatabaseTarget(
          base,
          target('postgresql://u@127.0.0.1:5433/other')
        )
      ).to.be.false
      expect(
        isSameDatabaseTarget(
          base,
          target('postgresql://u@db.internal:5433/skkuding')
        )
      ).to.be.false
    })

    it('should keep host names that only look numeric-ish as regular hosts', () => {
      expect(target('postgresql://u@cafe.db:5433/skkuding').host).to.equal(
        'cafe.db'
      )
      expect(
        target('postgresql://u@127.example.com:5433/skkuding').host
      ).to.equal('127.example.com')
    })
  })

  describe('assertSafeTestDatabase', () => {
    it('should allow a separated local test database (pnpm test)', () => {
      expect(guard('reset', { TEST_DATABASE_URL: TEST_URL })()).to.deep.equal({
        host: 'loopback',
        port: 5434,
        database: 'skkuding'
      })
      expect(
        guard('connect', {
          TEST_DATABASE_URL: TEST_URL,
          DATABASE_URL: TEST_URL
        })()
      ).to.deep.include({ port: 5434 })
    })

    it('should allow DATABASE_URL written differently for the same test database', () => {
      expect(
        guard('connect', {
          TEST_DATABASE_URL: TEST_URL,
          DATABASE_URL: 'postgres://other:pw@localhost:5434/skkuding'
        })
      ).to.not.throw()
    })

    it('should block when TEST_DATABASE_URL is missing', () => {
      expect(guard('reset', {})).to.throw(
        TestDatabaseGuardError,
        'TEST_DATABASE_URL'
      )
      expect(guard('connect', { DATABASE_URL: TEST_URL })).to.throw(
        TestDatabaseGuardError,
        'TEST_DATABASE_URL'
      )
    })

    it('should block a direct mocha run without DATABASE_URL', () => {
      expect(guard('connect', { TEST_DATABASE_URL: TEST_URL })).to.throw(
        TestDatabaseGuardError,
        'DATABASE_URL is not set'
      )
    })

    it('should block when DATABASE_URL points to the development database', () => {
      expect(
        guard('connect', { TEST_DATABASE_URL: TEST_URL, DATABASE_URL: DEV_URL })
      ).to.throw(TestDatabaseGuardError, 'different databases')
    })

    it('should block the exported .env case (set -a; source .env; pnpm exec mocha)', () => {
      // 이전 사고 정황과 같은 구성: .env의 두 값이 그대로 export된 상태
      expect(
        guard('connect', { DATABASE_URL: DEV_URL, TEST_DATABASE_URL: TEST_URL })
      ).to.throw(TestDatabaseGuardError)
    })

    it('should block when TEST_DATABASE_URL points to the development database', () => {
      const devAsTest = 'postgresql://x:y@localhost:5433/skkuding'
      expect(guard('reset', { TEST_DATABASE_URL: devAsTest })).to.throw(
        TestDatabaseGuardError,
        'local development database'
      )
      expect(
        guard('connect', {
          TEST_DATABASE_URL: devAsTest,
          DATABASE_URL: devAsTest
        })
      ).to.throw(TestDatabaseGuardError, 'local development database')
    })

    it('should block the development database written with a loopback alias', () => {
      // 회귀: 127.1 등은 Prisma가 개발 DB(127.0.0.1:5433)로 접속하지만 이전에는 다른 호스트로 판단해 reset을 허용했다.
      for (const host of ['127.1', '2130706433', '[::ffff:127.0.0.1]']) {
        expect(
          guard('reset', {
            TEST_DATABASE_URL: `postgresql://x:y@${host}:5433/skkuding`
          })
        ).to.throw(TestDatabaseGuardError)
      }
      expect(
        guard('reset', {
          TEST_DATABASE_URL: 'postgresql://x:y@localhost.:5433/skkuding'
        })
      ).to.throw(TestDatabaseGuardError, 'local development database')
    })

    it('should not let the isolated flag bypass the development database comparison', () => {
      expect(
        guard('reset', {
          TEST_DATABASE_URL: DEV_URL,
          TEST_DATABASE_ISOLATED: 'true'
        })
      ).to.throw(TestDatabaseGuardError, 'local development database')
    })

    it('should block malformed URLs', () => {
      expect(guard('reset', { TEST_DATABASE_URL: 'localhost:5434' })).to.throw(
        TestDatabaseGuardError
      )
      expect(
        guard('connect', {
          TEST_DATABASE_URL: TEST_URL,
          DATABASE_URL: 'garbage'
        })
      ).to.throw(TestDatabaseGuardError)
    })

    it('should block when the development DATABASE_URL in .env is malformed', () => {
      expect(
        guard('reset', { TEST_DATABASE_URL: TEST_URL }, 'garbage')
      ).to.throw(TestDatabaseGuardError)
    })

    it('should allow the disposable CI database with the explicit isolated flag', () => {
      expect(
        guard(
          'connect',
          {
            DATABASE_URL: CI_URL,
            TEST_DATABASE_URL: CI_URL,
            TEST_DATABASE_ISOLATED: 'true'
          },
          NO_DEV_ENV
        )
      ).to.not.throw()
    })

    it('should not skip the checks just because CI=true', () => {
      expect(
        guard(
          'connect',
          { DATABASE_URL: CI_URL, TEST_DATABASE_URL: CI_URL, CI: 'true' },
          NO_DEV_ENV
        )
      ).to.throw(TestDatabaseGuardError, 'TEST_DATABASE_ISOLATED')
      expect(
        guard(
          'connect',
          { TEST_DATABASE_URL: CI_URL, TEST_DATABASE_ISOLATED: 'true' },
          NO_DEV_ENV
        )
      ).to.throw(TestDatabaseGuardError, 'DATABASE_URL is not set')
    })

    it('should never include URLs or credentials in error messages', () => {
      const cases = [
        guard('connect', {
          TEST_DATABASE_URL: TEST_URL,
          DATABASE_URL: DEV_URL
        }),
        guard('reset', { TEST_DATABASE_URL: DEV_URL }),
        guard('reset', {
          TEST_DATABASE_URL: 'mysql://leak-user:leak-secret@h/db'
        })
      ]
      for (const run of cases) {
        try {
          run()
          expect.fail('should have thrown')
        } catch (error) {
          const message = (error as Error).message
          for (const secret of [
            'dev-secret',
            'test-secret',
            'leak-secret',
            'dev-user',
            '127.0.0.1',
            '5433',
            '5434',
            'postgresql://'
          ]) {
            expect(message).to.not.include(secret)
          }
        }
      }
    })
  })

  describe('readDevelopmentDatabaseUrl', () => {
    let dir: string

    beforeEach(() => {
      dir = mkdtempSync(join(tmpdir(), 'test-db-guard-'))
    })

    afterEach(() => {
      rmSync(dir, { recursive: true, force: true })
    })

    it('should read DATABASE_URL without loading it into process.env', () => {
      const file = join(dir, '.env')
      writeFileSync(file, `DATABASE_URL="${DEV_URL}"\nTEST_ONLY_GUARD_KEY=1\n`)

      expect(readDevelopmentDatabaseUrl(file)).to.equal(DEV_URL)
      expect(process.env.TEST_ONLY_GUARD_KEY).to.be.undefined
    })

    it('should return undefined when the file or the entry is missing', () => {
      expect(readDevelopmentDatabaseUrl(join(dir, 'missing.env'))).to.be
        .undefined

      const file = join(dir, '.env')
      writeFileSync(file, 'OTHER=1\nDATABASE_URL=\n')
      expect(readDevelopmentDatabaseUrl(file)).to.be.undefined
    })
  })
})
