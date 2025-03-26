import { safeFetcherWithAuth } from '@/libs/utils'
import type { Assignment, AssignmentGrade } from '@/types/type'

export interface GetAssignmentRequest {
  assignmentId: number
}

export type GetAssignmentResponse = Assignment

export const getAssignment = async ({ assignmentId }: GetAssignmentRequest) => {
  const response = await safeFetcherWithAuth.get(`assignment/${assignmentId}`)
  const data = await response.json<GetAssignmentResponse>()
  return data
}

export interface GetAssignmentsRequest {
  courseId: string
}

export type GetAssignmentsResponse = Assignment[]

export const getAssignments = async ({ courseId }: GetAssignmentsRequest) => {
  const response = await safeFetcherWithAuth.get('assignment', {
    searchParams: { groupId: courseId }
  })
  const data = await response.json<GetAssignmentsResponse>()
  return data
}

export interface GetAssignmentRecordRequest {
  assignmentId: string
}

export type GetAssignmentRecordResponse = AssignmentGrade

export const getAssignmentRecord = async ({
  assignmentId
}: GetAssignmentRecordRequest) => {
  const response = await safeFetcherWithAuth.get(
    `assignment/${assignmentId}/score/me`
  )
  const data = await response.json<GetAssignmentRecordResponse>()
  return data
}
