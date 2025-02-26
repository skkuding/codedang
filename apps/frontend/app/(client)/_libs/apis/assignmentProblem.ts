import { safeFetcherWithAuth } from '@/libs/utils'
import type { AssignmentProblem, ProblemDetail } from '@/types/type'
import type { PaginationQueryParams } from './types'

export interface GetAssignmentProblemListRequest extends PaginationQueryParams {
  assignmentId: number
}

export interface GetAssignmentProblemListResponse {
  data: AssignmentProblem[]
  total: number
}

export const getAssignmentProblemList = async ({
  assignmentId,
  ...searchParams
}: GetAssignmentProblemListRequest) => {
  const response = await safeFetcherWithAuth.get(
    `assignment/${assignmentId}/problem`,
    {
      searchParams
    }
  )

  const data = response.json<GetAssignmentProblemListResponse>()

  return data
}

// --------------------------------------------------------------------

export interface GetAssignmentProblemDetailRequest {
  assignmentId: number
  problemId: number
}

export interface GetAssignmentProblemDetailResponse {
  order: number
  problem: ProblemDetail
}

// * api자리
