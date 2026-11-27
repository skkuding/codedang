/**
 * `pnpm test`의 pretest에서 `prisma migrate reset --force` 직전에 실행됩니다.
 * TEST_DATABASE_URL이 안전한 테스트 DB를 가리키지 않으면 0이 아닌 코드로 종료해,
 * 뒤이은 reset 명령이 실행되지 않게 합니다.
 */
import {
  runTestDatabaseGuard,
  TestDatabaseGuardError
} from '../libs/prisma/src/test-db-guard'

try {
  runTestDatabaseGuard('reset')
} catch (error) {
  if (error instanceof TestDatabaseGuardError) {
    console.error(error.message)
    process.exit(1)
  }
  throw error
}
