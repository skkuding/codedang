import { safeFetcherWithAuth } from '@/libs/utils'
import type { SubmissionDetail, SubmissionItem } from '@/types/type'
import type { PaginationQueryParams } from './types'

export interface GetContestSubmissionListRequest extends PaginationQueryParams {
  problemId: number
  contestId: number
}

export interface GetContestSubmissionListResponse {
  data: SubmissionItem[]
  total: number
}

export const getContestSubmissionList = async ({
  contestId,
  ...searchParams
}: GetContestSubmissionListRequest) => {
  const response = await safeFetcherWithAuth.get(
    `contest/${contestId}/submission`,
    {
      searchParams
    }
  )

  const data = await response.json<GetContestSubmissionListResponse>()

  return data
}

export interface GetContestSubmissionDetailRequest {
  contestId: number
  problemId: number
  submissionId: number
}

export const getContestSubmissionDetail = async ({
  contestId,
  problemId,
  submissionId
}: GetContestSubmissionDetailRequest) => {
  const response = await safeFetcherWithAuth.get(`submission/${submissionId}`, {
    searchParams: { problemId, contestId }
  })

  const data = await response.json<SubmissionDetail>()
  return data
}
