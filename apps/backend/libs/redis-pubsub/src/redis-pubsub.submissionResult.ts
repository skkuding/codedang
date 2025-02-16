import type { ResultStatus } from '@prisma/client'

export interface TestcaseResult {
  submissionId: number
  problemTestcaseId: number
  result: ResultStatus
  cpuTime: string
  memoryUsage: number
}

export interface PubSubSubmissionResult {
  submissionId: number
  result: TestcaseResult
}
