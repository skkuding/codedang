import { safeFetcher } from '@/libs/utils'
import type { SubmissionItem } from '@/types/type'
import type { PaginationQueryParams } from './types'

export interface GetProblemSubmissionListRequest extends PaginationQueryParams {
  problemId: number
}

export interface GetProblemSubmissionListResponse {
  data: SubmissionItem[]
  total: number
}

export const getProblemSubmissionList = async ({
  ...searchParams
}: GetProblemSubmissionListRequest) => {
  const response = await safeFetcher.get('submission', {
    searchParams
  })

  const data = await response.json<GetProblemSubmissionListResponse>()

  return data
}
