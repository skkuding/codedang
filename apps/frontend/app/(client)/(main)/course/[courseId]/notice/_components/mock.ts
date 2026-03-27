import type { CourseNoticeListItem } from '@/types/type'

export const mockCourseNotices: CourseNoticeListItem[] = [
  {
    id: 1,
    title: '중간고사 범위 및 유의사항 안내',
    createTime: '2026-03-20T09:00:00.000Z',
    updateTime: '2026-03-20T09:00:00.000Z',
    isFixed: true,
    createdBy: '김교수',
    isRead: false,
    commentCount: 3
  },
  {
    id: 2,
    title: '3주차 강의자료 업로드',
    createTime: '2026-03-24T06:30:00.000Z',
    updateTime: '2026-03-24T06:30:00.000Z',
    isFixed: false,
    createdBy: '김교수',
    isRead: true,
    commentCount: 0
  },
  {
    id: 3,
    title: '4주차 강의자료 업로드',
    createTime: '2026-03-31T06:30:00.000Z',
    updateTime: '2026-03-31T06:30:00.000Z',
    isFixed: false,
    createdBy: '권교수',
    isRead: true,
    commentCount: 7
  }
]
