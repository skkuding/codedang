import { safeFetcherWithAuth } from '@/libs/utils'
import type {
  AssignmentScore,
  ProblemSubmissionResultResponse,
  SubmissionDetail,
  SubmissionItem,
  SubmissionResponse
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

export interface GetAssignmentScoreRequest {
  assignmentId: number
  courseId: number
}

export const getAssignmentScore = async ({
  assignmentId,
  courseId
}: GetAssignmentScoreRequest) => {
  const response = await safeFetcherWithAuth.get(
    `assignment/${assignmentId}/score/me`,
    {
      searchParams: { groupId: courseId }
    }
  )

  const data = await response.json<AssignmentScore>()
  console.log('Fetched data:', data)
  return data
}

export interface GetProblemSubmissionResultRequest {
  assignmentId: number
  problemId: number
}

export const getProblemSubmissionResult = async ({
  assignmentId,
  problemId
}: GetProblemSubmissionResultRequest) => {
  const response = await safeFetcherWithAuth.get(
    `assignment/${assignmentId}/submission`,
    {
      searchParams: { problemId }
    }
  )

  const data = await response.json<ProblemSubmissionResultResponse>()
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
