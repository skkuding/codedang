import type { Assignment } from '@/types/type'

type WorkStatus = 'upcoming' | 'ongoing' | 'finished'

interface WorkItem {
  id: number
  title: string
  isExercise: boolean
  startTime: Date
  endTime: Date
  dueTime?: Date
  problemCount: number
  week?: number
  status?: WorkStatus
  raw: Assignment
}

interface GroupedRows {
  courseId: number
  courseTitle: string
  rows: WorkItem[]
}

export type { GroupedRows, WorkItem }
