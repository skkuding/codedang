import { isHttpError, safeFetcherWithAuth } from '@/libs/utils'
import type {
  Assignment,
  AssignmentProblemRecord,
  AssignmentSummary
} from '@/types/type'

export interface GetAssignmentRequest {
  assignmentId: string
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

export interface GetAssignmentProblemRecordRequest {
  assignmentId: string
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
  courseId: string
}

export type GetAssignmentsSummaryResponse = AssignmentSummary[]

export const getAssignmentsSummary = async ({
  courseId
}: GetAssignmentsSummaryRequest) => {
  try {
    const response = await safeFetcherWithAuth.get('assignment/me/summary', {
      searchParams: { groupId: courseId }
    })
    const data = await response.json<GetAssignmentsSummaryResponse>()
    return data
  } catch (error) {
    if (isHttpError(error) && error.response.status === 403) {
      participateAllOngoingAssignments({ courseId })
    }
  }
}

export interface ParticipateAllOngoingAssignmentsRequest {
  courseId: string
}

export const participateAllOngoingAssignments = async ({
  courseId
}: ParticipateAllOngoingAssignmentsRequest) => {
  const response = await safeFetcherWithAuth.post('assignment/participation', {
    searchParams: { groupId: courseId }
  })
  // 정상 응답 시, 과제 요약 정보 다시 가져오기
  if (response.ok) {
    getAssignmentsSummary({ courseId })
  }
}
