import { safeFetcherWithAuth } from '@/libs/utils'
import type {
  CourseNoticeCommentGroup,
  CourseNoticeDetailResponse,
  CourseNoticeListItem,
  CourseNoticeListResponse
} from '@/types/type'

export interface GetCourseNoticesRequest {
  courseId: number
}

export type GetCourseNoticesResponse = CourseNoticeListItem[]

export const getCourseNotices = async ({
  courseId
}: GetCourseNoticesRequest) => {
  const params = { take: '100', readFilter: 'all', order: 'createTime-desc' }
  const [fixedRes, normalRes] = await Promise.all([
    safeFetcherWithAuth
      .get(`course/${courseId}/notice/all`, {
        searchParams: { ...params, fixed: 'true' }
      })
      .json<CourseNoticeListResponse>(),
    safeFetcherWithAuth
      .get(`course/${courseId}/notice/all`, {
        searchParams: { ...params, fixed: 'false' }
      })
      .json<CourseNoticeListResponse>()
  ])
  return [...fixedRes.data, ...normalRes.data]
}

export interface GetCourseNoticeDetailRequest {
  courseId: number
  noticeId: number
}

export type GetCourseNoticeDetailResponse = CourseNoticeDetailResponse

export const getCourseNoticeDetail = async ({
  courseId,
  noticeId
}: GetCourseNoticeDetailRequest) => {
  const response = await safeFetcherWithAuth.get(
    `course/${courseId}/notice/${noticeId}`
  )
  const data = await response.json<GetCourseNoticeDetailResponse>()
  return data
}

export interface GetCourseNoticeCommentsRequest {
  noticeId: number
}

export type GetCourseNoticeCommentsResponse = CourseNoticeCommentGroup[]

export const getCourseNoticeComments = async ({
  noticeId
}: GetCourseNoticeCommentsRequest) => {
  const response = await safeFetcherWithAuth.get(
    `course/notice/${noticeId}/comment`,
    { searchParams: { take: '100', includeDeleted: 'true' } }
  )
  const data = await response.json<GetCourseNoticeCommentsResponse>()
  return data
}
