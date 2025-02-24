import { safeFetcherWithAuth } from '@/libs/utils'
import type { SubmissionDetail, SubmissionItem } from '@/types/type'
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
