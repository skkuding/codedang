import { safeFetcher } from '@/libs/utils'
import type { ProblemDetail, Problem } from '@/types/type'
import type { PaginationQueryParams } from './types'
import { createSafeGETAPIResquestFunction } from './utils'

export interface GetProblemListRequest extends PaginationQueryParams {
  search?: string
  order: string
}

export interface GetProblemListResponse {
  data: Problem[]
  total: number
}

export const getProblemList = async ({
  ...searchParams
}: GetProblemListRequest) => {
  const response = await safeFetcher.get('problem', {
    searchParams
  })
  const data = await response.json<GetProblemListResponse>()

  return data
}

// -------------------------------------------------------------------

export interface GetProblemDetailRequest {
  problemId: number
}

export interface GetProblemDetailResponse extends ProblemDetail {}

export const getProblemDetail = async ({
  problemId
}: GetProblemDetailRequest) => {
  const response = await safeFetcher.get(`problem/${problemId}`)

  const data = await response.json<GetProblemDetailResponse>()

  return data
}

export const safeGetProblemDetail =
  createSafeGETAPIResquestFunction(getProblemDetail)
