import type { Assignment } from '@/types/type'

interface CourseAssignmentList {
  courseId: number
  courseTitle: string
  assignments: Assignment[]
}

export type { CourseAssignmentList }
