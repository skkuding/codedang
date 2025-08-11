import { safeFetcherWithAuth } from '@/libs/utils'
import type {
  Assignment,
  AssignmentProblemRecord,
  AssignmentSummary
} from '@/types/type'

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
  courseId: number
  isExercise: boolean
}

export type GetAssignmentsResponse = Assignment[]

export const getAssignments = async ({
  courseId,
  isExercise
}: GetAssignmentsRequest) => {
  const response = await safeFetcherWithAuth.get('assignment', {
    searchParams: { groupId: courseId, isExercise }
  })
  const data = await response.json<GetAssignmentsResponse>()
  return data
}

export interface GetAssignmentProblemRecordRequest {
  assignmentId: number
}

export type GetAssignmentProblemRecordResponse = AssignmentProblemRecord

export const getAssignmentProblemRecord = async ({
  assignmentId
}: GetAssignmentProblemRecordRequest) => {
  const response = await safeFetcherWithAuth.get(
    `assignment/${assignmentId}/me`
  )
  const data = await response.json<GetAssignmentProblemRecordResponse>()
  return data
}

export interface GetAssignmentsSummaryRequest {
  courseId: number
  isExercise?: boolean
}

export type GetAssignmentsSummaryResponse = AssignmentSummary[]

export const getAssignmentsSummary = async ({
  courseId,
  isExercise = false
}: GetAssignmentsSummaryRequest) => {
  const response = await safeFetcherWithAuth.get('assignment/me/summary', {
    searchParams: { groupId: courseId, isExercise }
  })
  const data = await response.json<GetAssignmentsSummaryResponse>()
  return data
}
