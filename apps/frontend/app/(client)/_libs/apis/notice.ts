import { safeFetcherWithAuth } from '@/libs/utils'

export interface CourseNoticeListItem {
  id: number
  title: string
  updateTime: string
  isFixed: boolean
  commentCount: number
  isRead: boolean
  createdBy: string | null
}

export interface CourseNoticeListResponse {
  data: CourseNoticeListItem[]
  total: number
}

export interface CourseNoticeDetail {
  groupId: number
  isPublic: boolean
  title: string
  content: string
  createTime: string
  updateTime: string
  createdBy: string | null
  _count: {
    CourseNoticeComment: number
  }
}

export interface CourseNoticeDetailResponse {
  current: CourseNoticeDetail
  prev: { id: number; title: string } | null
  next: { id: number; title: string } | null
}

export const getCourseNotices = async ({
  groupId,
  cursor,
  take = 10,
  fixed = false,
  readFilter = 'all',
  search,
  order
}: {
  groupId: number
  cursor?: number | null
  take?: number
  fixed?: boolean
  readFilter?: 'all' | 'unread'
  search?: string
  order?: string
}) => {
  const searchParams: Record<string, string | number | boolean> = {
    take,
    fixed,
    readFilter
  }
  if (cursor) {
    searchParams.cursor = cursor
  }
  if (search) {
    searchParams.search = search
  }
  if (order) {
    searchParams.order = order
  }

  const response = await safeFetcherWithAuth.get(
    `course/${groupId}/notice/all`,
    { searchParams }
  )
  return await response.json<CourseNoticeListResponse>()
}

export const getCourseNoticeById = async (noticeId: number) => {
  const response = await safeFetcherWithAuth.get(`course/notice/${noticeId}`)
  return await response.json<CourseNoticeDetailResponse>()
}
