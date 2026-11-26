/**
 * mocha가 spec 파일을 import하기 전에 테스트 DB 설정을 검사합니다.
 *
 * `.mocharc.json`의 `require`로 로드되므로 spec 로드와 `@prisma/client`의 `.env` 주입보다 먼저 실행됩니다.
 * (`mochaGlobalSetup`은 spec 로드 이후에 실행되므로 이 용도로 쓸 수 없습니다.)
 *
 * `@libs/prisma`(index)를 import하면 `@prisma/client`가 함께 로드되므로, 검사 모듈만 직접 import합니다.
 */
import {
  runTestDatabaseGuard,
  TestDatabaseGuardError
} from './libs/prisma/src/test-db-guard'

try {
  runTestDatabaseGuard('connect')
} catch (error) {
  // require 모듈이 예외를 던지면 mocha는 ESM import로 다시 시도하면서 원래 오류 대신
  // 'Cannot find module' 오류를 출력하므로, 검사 실패는 여기서 직접 출력하고 종료합니다.
  if (error instanceof TestDatabaseGuardError) {
    console.error(error.message)
    process.exit(1)
  }
  throw error
}
