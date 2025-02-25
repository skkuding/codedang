import type { AssignmentProblem, ProblemDetail } from '@/types/type'
import type { PaginationQueryParams } from './types'

export interface GetAssignmentProblemListRequest extends PaginationQueryParams {
  groupId?: number
  contestId: number
}

export interface GetAssignmentProblemListResponse {
  data: AssignmentProblem[]
  total: number
}

// * api자리

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
