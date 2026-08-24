import { queryOptions } from '@tanstack/react-query'
import {
  getCourseNoticeComments,
  getCourseNoticeDetail,
  getCourseNotices,
  type GetCourseNoticeCommentsRequest,
  type GetCourseNoticeDetailRequest,
  type GetCourseNoticesRequest
} from '../apis/courseNotice'

export const courseNoticeQueries = {
  list: ({ courseId }: GetCourseNoticesRequest) =>
    queryOptions({
      queryKey: ['courseNotices', courseId],
      queryFn: () => getCourseNotices({ courseId })
    }),
  detail: ({ courseId, noticeId }: GetCourseNoticeDetailRequest) =>
    queryOptions({
      queryKey: ['courseNoticeDetail', courseId, noticeId],
      queryFn: () => getCourseNoticeDetail({ courseId, noticeId })
    }),
  comments: ({ noticeId }: GetCourseNoticeCommentsRequest) =>
    queryOptions({
      queryKey: ['courseNoticeComments', noticeId],
      queryFn: () => getCourseNoticeComments({ noticeId })
    })
}
