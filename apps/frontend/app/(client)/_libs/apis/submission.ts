import { safeFetcherWithAuth } from '@/libs/utils'
import type { Submission, SubmissionDetail } from '@/types/type'
import type { PaginationQueryParams } from './types'

export interface GetSubmissionsRequest extends PaginationQueryParams {
  contestId: number
  problemId: number
}

export interface GetSubmissionsResponse {
  data: Submission[]
  total: number
}

export const getSubmissions = async ({
  contestId,
  problemId,
  ...searchParams
}: GetSubmissionsRequest): Promise<GetSubmissionsResponse> => {
  const response = await safeFetcherWithAuth.get(
    `contest/${contestId}/submission`,
    {
      searchParams: { ...searchParams, problemId }
    }
  )
  const data = await response.json<GetSubmissionsResponse>()
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
