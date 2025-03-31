import { safeFetcherWithAuth } from '@/libs/utils'
import type {
  AssignmentProblemRecord,
  Language,
  SubmissionDetail,
  SubmissionItem
} from '@/types/type'
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
  assignmentId: string
  courseId: string
}

export const getAnonymizedScores = async ({
  assignmentId,
  courseId
}: GetAnonymizedScoresRequest) => {
  const response = await safeFetcherWithAuth.get(
    `assignment/${assignmentId}/anonymized-scores`,
    {
      searchParams: { groupId: courseId }
    }
  )

  const data = await response.json<AnonymizedScore>()
  return data
}

export interface GetLatestProblemSubmissionResultRequest {
  assignmentId: number
  problemId: number
}

export const getLatestProblemSubmissionResult = async ({
  assignmentId,
  problemId
}: GetLatestProblemSubmissionResultRequest) => {
  const response = await safeFetcherWithAuth.get(
    `assignment/${assignmentId}/submission/latest`,
    {
      searchParams: { problemId }
    }
  )

  const data = await response.json<ProblemSubmissionResult>()
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
  return data
}

export interface GetTestResultRequest {
  assignmentId: number
  problemId: number
  submissionId: number
}

export interface SubmissionResponse {
  problemId: number
  username: string
  code: string
  language: Language
  createTime: string
  result: string
  testcaseResult: TestcaseResult[]
}
export interface TestcaseResult {
  id: number
  submissionId: number
  problemTestcaseId: number
  result: string
  cpuTime: number | null
  memoryUsage: number | null
  createTime: string
  updateTime: string
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
  return data
}

export interface GetAssignmentGradesRequest {
  groupId: number
}

export type GetAssignmentGradesResponse = AssignmentProblemRecord[]

export const getAssignmentGrades = async ({
  groupId
}: GetAssignmentGradesRequest) => {
  const response = await safeFetcherWithAuth.get(`course/${groupId}/grade`)
  const data = await response.json<GetAssignmentGradesResponse>()
  return data
}
