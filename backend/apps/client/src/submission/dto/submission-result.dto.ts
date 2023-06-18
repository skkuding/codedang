import type { SubmissionResult } from '@prisma/client'

export interface SubmissionResultDTO {
  submissionResults: SubmissionResult[]
  score?: number
  passed: boolean
}
