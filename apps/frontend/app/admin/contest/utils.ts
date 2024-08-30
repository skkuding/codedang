import { z } from 'zod'

export const createSchema = z.object({
  title: z
    .string()
    .min(1)
    .max(100, 'The title can only be up to 100 characters long'),
  isRankVisible: z.boolean(),
  isVisible: z.boolean(),
  description: z
    .string()
    .min(1)
    .refine((value) => value !== '<p></p>'),
  startTime: z.date(),
  endTime: z.date(),
  enableCopyPaste: z.boolean(),
  isJudgeResultVisible: z.boolean(),
  invitationCode: z
    .string()
    .regex(/^\d{6}$/, 'The invitation code must be a 6-digit number')
    .nullish()
})

export const editSchema = createSchema.extend({
  id: z.number()
})

export interface ContestProblem {
  id: number
  title: string
  order: number
  difficulty: string
  score: number
}

export interface ScoreSummary {
  studentId: string
  realName?: string | null
  username: string
  submittedProblemCount: number
  totalProblemCount: number
  userContestScore: number
  contestPerfectScore: number
  problemScores: {
    problemId: number
    score: number
    maxScore: number
  }[]
}

export interface ProblemData {
  order: number
  score: number
  problemId: number
}

export interface OverallSubmission {
  title: string
  studentId: string
  realname?: string | null
  username: string
  result: string
  language: string
  submissionTime: string
  codeSize?: number | null
  ip?: string | null
  id: number
  order: number
}

export interface UserSubmission {
  problemTitle: string
  submissionResult: string
  language: string
  submissionTime: string
  codeSize?: number | null
  ip?: string | null
  id: number
  order: number
}
