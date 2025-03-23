import { safeFetcherWithAuth } from '@/libs/utils'
import type { Assignment } from '@/types/type'

export interface GetAssignmentRequest {
  assignmentId: number
}

export type GetAssignmentResponse = Assignment

export const getAssignment = async ({ assignmentId }: GetAssignmentRequest) => {
  const response = await safeFetcherWithAuth.get(`assignment/${assignmentId}`)
  const data = await response.json<GetAssignmentResponse>()
  return data
}
