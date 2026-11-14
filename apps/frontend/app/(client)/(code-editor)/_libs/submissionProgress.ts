import type { SubmissionDetail } from '@/types/type'

export interface SubmissionProgress {
  stage: 'waiting' | 'grading' | 'finished' | 'error'
  completed: number
  total: number
  result?: string
  runtime?: number
  memoryUsage?: number
  failedCase?: number
  message?: string
}

type TestcaseResult = SubmissionDetail['testcaseResult'][number]
type ProgressResponse = Pick<SubmissionDetail, 'result'> & {
  testcaseResult: (Omit<TestcaseResult, 'cpuTime' | 'memoryUsage'> & {
    cpuTime: string | null
    memoryUsage: number | null
  })[]
}

export function getProgressValue(completed: number, total: number) {
  if (!Number.isFinite(total) || total <= 0 || !Number.isFinite(completed)) {
    return 0
  }
  return Math.min(100, Math.max(0, (completed / total) * 100))
}

export function getSubmissionProgress(
  submission: ProgressResponse
): SubmissionProgress {
  const testcases = [...submission.testcaseResult].sort(
    (a, b) => a.problemTestcaseId - b.problemTestcaseId
  )
  const total = testcases.length
  if (submission.result === 'Blind') {
    return { stage: 'finished', completed: 0, total, result: 'Blind' }
  }
  const completed = testcases.filter(
    ({ result }) => !['Judging', 'Canceled', 'Blind'].includes(result)
  ).length

  if (submission.result === 'Judging') {
    return { stage: completed > 0 ? 'grading' : 'waiting', completed, total }
  }

  const failedCaseIndex = testcases.findIndex(
    ({ result }) =>
      !['Accepted', 'Judging', 'Canceled', 'Blind'].includes(result)
  )
  const runtimes = testcases
    .filter(({ cpuTime }) => cpuTime !== null)
    .map(({ cpuTime }) => Number(cpuTime))
    .filter((value) => Number.isFinite(value) && value >= 0)
  const memoryUsages = testcases
    .map(({ memoryUsage }) => memoryUsage)
    .filter(
      (value): value is number =>
        value !== null && Number.isFinite(value) && value >= 0
    )

  return {
    stage: 'finished',
    completed,
    total,
    result: submission.result,
    runtime: runtimes.length ? Math.max(...runtimes) : undefined,
    memoryUsage: memoryUsages.length ? Math.max(...memoryUsages) : undefined,
    failedCase: failedCaseIndex === -1 ? undefined : failedCaseIndex + 1
  }
}

export function getSubmissionResultLabel(result?: string) {
  const labels: Record<string, string> = {
    Accepted: '맞았습니다!',
    WrongAnswer: '틀렸습니다!',
    CompileError: '컴파일 오류',
    RuntimeError: '실행 오류',
    TimeLimitExceeded: '시간 제한 초과',
    MemoryLimitExceeded: '메모리 제한 초과',
    OutputLimitExceeded: '출력 제한 초과',
    ServerError: '채점 서버 오류',
    SegmentationFaultError: '메모리 접근 오류',
    Blind: '채점 결과 비공개',
    Canceled: '채점 취소'
  }
  return result ? (labels[result] ?? '채점 완료') : '채점 완료'
}
