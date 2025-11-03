import type { Language } from '@/types/type'

export interface Solution {
  code: string
  language: Language
}

export interface AssignmentProblem {
  id: number
  title: string
  order: number
  difficulty: string
  score: number
  solutionReleaseTime: Date | null
  solution?: Solution[]
}

export interface ScoreSummary {
  studentId: string
  realName?: string | null
  username: string
  submittedProblemCount: number
  totalProblemCount: number
  userAssignmentScore: number
  assignmentPerfectScore: number
  scoreSummaryByProblem: {
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
  order?: number | null
  problemId: number
}

export interface UserSubmission {
  problemTitle: string
  submissionResult: string
  language: string
  submissionTime: string
  codeSize?: number | null
  ip?: string | null
  id: number
  order?: number | null
}
