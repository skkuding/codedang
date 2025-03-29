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
  courseId: string
}

export type GetAssignmentProblemRecordResponse = AssignmentProblemRecord

export const getAssignmentProblemRecord = async ({
  assignmentId,
  courseId
}: GetAssignmentProblemRecordRequest): Promise<
  GetAssignmentProblemRecordResponse | undefined
> => {
  try {
    const response = await safeFetcherWithAuth.get(
      `assignment/${assignmentId}/me`
    )
    const data = await response.json<GetAssignmentProblemRecordResponse>()
    return data
  } catch (error) {
    if (isHttpError(error) && error.response.status === 403) {
      await participateAllOngoingAssignments({ courseId })

      try {
        const retryResponse = await safeFetcherWithAuth.get(
          `assignment/${assignmentId}/me`
        )
        const retryData =
          await retryResponse.json<GetAssignmentProblemRecordResponse>()
        return retryData
      } catch (retryError) {
        console.error('Retry failed:', retryError)
        return undefined
      }
    } else {
      console.error('getAssignmentProblemRecord failed:', error)
      return undefined
    }
  }
}

export interface GetAssignmentsSummaryRequest {
  courseId: string
}

export type GetAssignmentsSummaryResponse = AssignmentSummary[]

export const getAssignmentsSummary = async ({
  courseId
}: GetAssignmentsSummaryRequest): Promise<
  GetAssignmentsSummaryResponse | undefined
> => {
  try {
    const response = await safeFetcherWithAuth.get('assignment/me/summary', {
      searchParams: { groupId: courseId }
    })
    const data = await response.json<GetAssignmentsSummaryResponse>()
    return data
  } catch (error) {
    if (isHttpError(error) && error.response.status === 403) {
      // 참여 먼저 시도
      await participateAllOngoingAssignments({ courseId })

      // 재요청
      try {
        const retryResponse = await safeFetcherWithAuth.get(
          'assignment/me/summary',
          {
            searchParams: { groupId: courseId }
          }
        )
        const retryData =
          await retryResponse.json<GetAssignmentsSummaryResponse>()
        return retryData
      } catch (retryError) {
        console.error('Retry failed:', retryError)
        return undefined
      }
    } else {
      console.error('getAssignmentsSummary failed:', error)
      return undefined
    }
  }
}

export interface ParticipateAllOngoingAssignmentsRequest {
  courseId: string
}

export const participateAllOngoingAssignments = async ({
  courseId
}: ParticipateAllOngoingAssignmentsRequest) => {
  await safeFetcherWithAuth.post('assignment/participation', {
    searchParams: { groupId: courseId }
  })
}
