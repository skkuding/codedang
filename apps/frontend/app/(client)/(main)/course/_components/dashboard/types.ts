import type { Assignment } from '@/types/type'

interface DashboardCourseSection {
  courseId: number
  courseTitle: string
  assignments: Assignment[]
}

export type { DashboardCourseSection }
