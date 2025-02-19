import type { ResultStatus } from '@prisma/client'

/**
 * 특정 테스트케이스의 실행 결과를 나타냅니다.
 *
 * - `submissionId`: 해당 결과가 속한 제출 ID
 * - `problemTestcaseId`: 실행된 문제의 테스트케이스 ID
 * - `result`: 테스트케이스 실행 결과 상태
 * - `cpuTime`: 테스트케이스 실행에 걸린 cpu time (string)
 * - `memoryUsage`: 테스트케이스 실행 시 사용된 메모리
 */
export interface TestcaseResult {
  submissionId: number
  problemTestcaseId: number
  result: ResultStatus
  cpuTime: string | null
  memoryUsage: number | null
}

/**
 * Redis Pub/Sub을 통해 전달되는 제출 결과 데이터
 *
 * - `submissionId`: 해당 제출 결과가 속한 제출 ID
 * - `result`: 특정 테스트케이스의 실행 결과
 */
export interface PubSubSubmissionResult {
  submissionId: number
  result: TestcaseResult
}

export interface PubSubTestcaseResult {
  userTest: boolean
  testcaseResult: { id: number; result: string; output: string }
}
