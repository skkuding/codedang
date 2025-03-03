import { safeFetcherWithAuth } from '@/libs/utils'
import type {
  SubmissionDetail,
  SubmissionItem,
  SubmissionResponse
} from '@/types/type'
import type { NumberSchema } from 'valibot'
import type { PaginationQueryParams } from './types'

export interface GetAssignmentSubmissionListRequest
  extends PaginationQueryParams {
  problemId: number
  assignmentId: number
}

export interface GetAssignmentSubmissionListResponse {
  data: SubmissionItem[]
  total: number
}

export const getAssignmentSubmissionList = async ({
  assignmentId,
  ...searchParams
}: GetAssignmentSubmissionListRequest) => {
  const response = await safeFetcherWithAuth.get(
    `assignment/${assignmentId}/submission`,
    {
      searchParams
    }
  )

  const data = await response.json<GetAssignmentSubmissionListResponse>()

  return data
}

export interface GetAssignmentSubmissionDetailRequest {
  assignmentId: number
  problemId: number
  submissionId: number
}

export const getAssignmentSubmissionDetail = async ({
  assignmentId,
  problemId,
  submissionId
}: GetAssignmentSubmissionDetailRequest) => {
  const response = await safeFetcherWithAuth.get(`submission/${submissionId}`, {
    searchParams: { problemId, assignmentId }
  })

  const data = await response.json<SubmissionDetail>()
  return data
}

interface AnonymizedScore {
  assignmentId: number
  title: string
  totalParticipants: number
  autoFinalizeScore: boolean
  isFinalScoreVisible: boolean
  scores?: number[]
  finalScores?: number[]
}

export interface GetAnonymizedScoresRequest {
  assignmentId: number
  courseId: number
}

export const getAnonymizedScores = async ({
  assignmentId,
  courseId
}: GetAnonymizedScoresRequest) => {
  const response = await safeFetcherWithAuth.get(
    `assignment/${assignmentId}/score`,
    {
      searchParams: { anonymized: true, groupId: courseId }
    }
  )

  const data = await response.json<AnonymizedScore>()
  console.log('Fetched data:', data)
  return data
}

export interface GetProblemSubmissionResultsRequest {
  assignmentId: number
  problemId: number
}

export interface ProblemSubmissionResultsResponse {
  data: ProblemSubmissionResult[]
  total: number
}
export interface ProblemSubmissionResult {
  id: number
  user: {
    username: string
  }
  createTime: string
  language: string
  result: string
  codeSize: number
}

export const getProblemSubmissionResults = async ({
  assignmentId,
  problemId
}: GetProblemSubmissionResultsRequest) => {
  const response = await safeFetcherWithAuth.get(
    `assignment/${assignmentId}/submission`,
    {
      searchParams: { problemId }
    }
  )

  const data = await response.json<ProblemSubmissionResultsResponse>()
  console.log('Fetched data:', data)
  return data
}

export interface GetTestResultRequest {
  assignmentId: number
  problemId: number
  submissionId: number
}

export const getTestResult = async ({
  assignmentId,
  problemId,
  submissionId
}: GetTestResultRequest) => {
  const response = await safeFetcherWithAuth.get(`submission/${submissionId}`, {
    searchParams: { problemId, assignmentId }
  })

  const data = await response.json<SubmissionResponse>()
  console.log('Fetched data:', data)
  return data
}

export interface GetAssignmentGradesRequest {
  groupId: number
}

export type GetAssignmentGradesResponse = AssignmentGrade[]

export interface AssignmentGrade {
  id: number
  title: string
  endTime: string
  autoFinalizeScore: boolean
  isFinalScoreVisible: boolean
  isJudgeResultVisible: boolean
  week: number
  userAssignmentFinalScore: number | null
  userAssignmentJudgeScore: number | null
  assignmentPerfectScore: number
  problems: ProblemGrade[]
}
export interface ProblemGrade {
  id: number
  title: string
  order: number
  maxScore: number
  problemRecord: ProblemRecord | null
}

export interface ProblemRecord {
  finalScore: number
  score: number
  isSubmitted: boolean
  comment: string
}

export const getAssignmentGrades = async ({
  groupId
}: GetAssignmentGradesRequest) => {
  const response = await safeFetcherWithAuth.get(`course/${groupId}/grade`)
  const data = await response.json<GetAssignmentGradesResponse>()
  console.log('Fetched data:', data)
  return data
}
