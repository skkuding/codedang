import { safeFetcherWithAuth } from '@/libs/utils'
import type { ContestProblem, ProblemDetail } from '@/types/type'
import type { PaginationQueryParams } from './types'
import { createSafeGETAPIResquestFunction } from './utils'

export interface GetContestProblemListRequest extends PaginationQueryParams {
  groupId?: number
  contestId: number
}

export interface GetContestProblemListResponse {
  data: ContestProblem[]
  total: number
}

export const getContestProblemList = async ({
  contestId,
  ...searchParams
}: GetContestProblemListRequest) => {
  const response = await safeFetcherWithAuth.get(
    `contest/${contestId}/problem`,
    {
      searchParams
    }
  )

  const data = response.json<GetContestProblemListResponse>()

  return data
}

export const safeGetContestProblemList = createSafeGETAPIResquestFunction(
  getContestProblemList
)

// --------------------------------------------------------------------

export interface GetContestProblemDetailRequest {
  contestId: number
  problemId: number
}

export interface GetContestProblemDetailResponse {
  order: number
  problem: ProblemDetail
}

export const getContestProblemDetail = async ({
  contestId,
  problemId,
  ...searchParams
}: GetContestProblemDetailRequest) => {
  const response = await safeFetcherWithAuth.get(
    `contest/${contestId}/problem/${problemId}`,
    {
      searchParams
    }
  )

  const data = await response.json<GetContestProblemDetailResponse>()

  return data
}

export const safeGetContestProblemDetail = createSafeGETAPIResquestFunction(
  getContestProblemDetail
)
