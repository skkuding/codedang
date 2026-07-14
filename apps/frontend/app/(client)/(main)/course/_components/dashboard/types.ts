import type { Assignment } from '@/types/type'

interface CourseAssignments {
  courseId: number
  courseTitle: string
  assignments: Assignment[]
}

export type { CourseAssignments }
