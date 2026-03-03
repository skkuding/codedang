export interface NoticeData {
  id: number
  title: string
  content: string
  createTime: string
  updateTime: string
  isFixed: boolean
  isPublic: boolean
  createdBy: string
  isRead: boolean
}

const STORAGE_KEY = 'course-notices'

const defaultNotices: NoticeData[] = [
  {
    id: 888,
    title: "제 2회 'We Are SKKU Developer' 알고리즘 경진대회",
    content: '<p>기존 공지 내용</p>',
    createTime: '2025-01-27T10:00:00Z',
    updateTime: '2025-01-27T10:00:00Z',
    isFixed: true,
    isPublic: true,
    createdBy: 'Admin',
    isRead: true
  },
  ...Array.from({ length: 9 }, (_, i) => ({
    id: i + 1,
    title: "제 2회 'We Are SKKU Developer' 알고리즘 경진대회",
    content: '<p>기존 공지 내용</p>',
    createTime: '2025-02-07T18:00:00Z',
    updateTime: '2025-02-07T18:00:00Z',
    isFixed: false,
    isPublic: true,
    createdBy: '김교수',
    isRead: i % 3 !== 0
  }))
]

export function getNotices(): NoticeData[] {
  if (typeof window === 'undefined') {
    return defaultNotices
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    /* empty */
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultNotices))
  return defaultNotices
}

export function saveNotices(notices: NoticeData[]) {
  if (typeof window === 'undefined') {
    return
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notices))
}
