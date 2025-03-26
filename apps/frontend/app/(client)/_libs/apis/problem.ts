import { safeFetcher, safeFetcherWithAuth } from '@/libs/utils'
import type {
  AssignmentProblem,
  Problem,
  StudentAssignmentProblem
} from '@/types/type'
import type { PaginationQueryParams } from './types'

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

export interface GetAssignmentProblemsRequest {
  assignmentId: string
}

export type GetAssignmentProblemsResponse = StudentAssignmentProblem

export const getAssignments = async ({
  assignmentId
}: GetAssignmentProblemsRequest) => {
  const response = await safeFetcherWithAuth.get(
    `/assignment/${assignmentId}/score/me`
  )
  const data = await response.json<GetAssignmentProblemsResponse>()
  return data
}
