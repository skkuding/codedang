import type { Assignment } from '@/types/type'

interface GroupedRows {
  courseId: number
  courseTitle: string
  rows: Assignment[]
}

export type { GroupedRows }
