import { safeFetcher } from '@/libs/utils'
import type { Problem } from '@/types/type'
import type { PaginationQueryParams } from './types'

export interface GetProblemListRequest extends PaginationQueryParams {
  search?: string
  order?: string
}

export interface GetProblemListResponse {
  data: Problem[]
  total: number
}

export const getProblemList = async ({
  ...searchParams
}: GetProblemListRequest = {}) => {
  const response = await safeFetcher.get('problem', {
    searchParams
  })
  const data = await response.json<GetProblemListResponse>()

  return data
}
