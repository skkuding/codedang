/**
 * Iris sandbox 실행 결과 코드 (apps/iris/src/service/sandbox/status_code.go)
 * NOTE: RUN_SUCCESS는 정상 종료라는 뜻일 뿐 정답(Accepted)이 아니다.
 */
export const SandboxStatusCode = {
  RUN_SUCCESS: 0,
  CPU_TIME_LIMIT_EXCEEDED: 1,
  REAL_TIME_LIMIT_EXCEEDED: 2,
  MEMORY_LIMIT_EXCEEDED: 3,
  RUNTIME_ERROR: 4,
  COMPILE_ERROR: 5,
  SEGMENTATION_FAULT_ERROR: 6,
  SERVER_ERROR: 7
} as const

export type SandboxStatusCode =
  (typeof SandboxStatusCode)[keyof typeof SandboxStatusCode]

export interface IrisProgressPayload {
  total: number
  current: number
  statusCode: SandboxStatusCode
}

export interface ProgressEvent extends IrisProgressPayload {
  submissionId: number
}

/** error: 컴파일 에러·서버 에러로 중단 */
export type ProgressStatus = 'judging' | 'done' | 'error'

export interface ProgressUpdateMessage {
  type: 'progress'
  submissionId: number
  status: ProgressStatus
  completed: number
  total: number
  percentage: number
  lastStatusCode: SandboxStatusCode
  updatedAt: number
}

const STATUS_CODES: readonly number[] = Object.values(SandboxStatusCode)

function isSandboxStatusCode(value: unknown): value is SandboxStatusCode {
  return typeof value === 'number' && STATUS_CODES.includes(value)
}

export function isIrisProgressPayload(
  value: unknown
): value is IrisProgressPayload {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('total' in value) ||
    !('current' in value) ||
    !('statusCode' in value)
  ) {
    return false
  }
  const { total, current, statusCode } = value
  return (
    typeof total === 'number' &&
    Number.isInteger(total) &&
    total > 0 &&
    typeof current === 'number' &&
    Number.isInteger(current) &&
    current >= 0 &&
    isSandboxStatusCode(statusCode)
  )
}
