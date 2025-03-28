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
  const response = await safeFetcherWithAuth.get('assignment/me/summary', {
    searchParams: { groupId: courseId }
  })
  // 403오류 시, 참여하지 않은 모든 과제 강제 참여시키기
  if (response.status === 403) {
    participateAllOngoingAssignments({ courseId })
  }
  const data = await response.json<GetAssignmentsSummaryResponse>()
  return data
}

export interface ParticipateAllOngoingAssignmentsRequest {
  courseId: string
}

export const participateAllOngoingAssignments = async ({
  courseId
}: ParticipateAllOngoingAssignmentsRequest) => {
  const response = await safeFetcherWithAuth.get('assignment/participation', {
    searchParams: { groupId: courseId }
  })
  // 정상 응답 시, 과제 요약 정보 다시 가져오기
  if (response.ok) {
    getAssignmentsSummary({ courseId })
  }
}
