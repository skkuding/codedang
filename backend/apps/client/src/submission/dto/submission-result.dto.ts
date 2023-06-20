import type { SubmissionResult } from '@prisma/client'

export interface SubmissionResultDTO {
  submissionResults: SubmissionResult[]
  score?: number
  judgeFinished: boolean
  passed: boolean
}
