import { safeFetcherWithAuth } from '@/libs/utils'
import type { Submission, SubmissionDetail } from '@/types/type'
import type { PaginationQueryParams } from './types'

export interface GetSubmissionListRequest extends PaginationQueryParams {
  contestId: number
  problemId: number
}

export interface GetSubmissionListResponse {
  data: Submission[]
  total: number
}

export const getSubmissionList = async ({
  contestId,
  problemId,
  ...searchParams
}: GetSubmissionListRequest): Promise<GetSubmissionListResponse> => {
  const response = await safeFetcherWithAuth.get(
    `contest/${contestId}/submission`,
    {
      searchParams: { ...searchParams, problemId }
    }
  )
  const data = await response.json<GetSubmissionListResponse>()
  return data
}

export interface GetSubmissionDetailRequest {
  contestId: number
  problemId: number
  submissionId: number
}

export const getSubmissionDetail = async ({
  contestId,
  problemId,
  submissionId
}: GetSubmissionDetailRequest): Promise<SubmissionDetail> => {
  const response = await safeFetcherWithAuth.get(`submission/${submissionId}`, {
    searchParams: { problemId, contestId }
  })

  const data = await response.json<SubmissionDetail>()
  return data
}
