import type { Assignment } from '@/types/type'

type WorkStatus = 'upcoming' | 'ongoing' | 'finished'

interface GroupInfo {
  id: number
  groupName: string
}

interface WorkItem {
  id: number
  title: string
  isExercise: boolean
  startTime: Date
  endTime: Date
  dueTime?: Date
  group: GroupInfo
  problemCount: number
  week?: number
  status?: WorkStatus
  raw: Assignment
}

interface GroupedRows {
  courseId: number
  courseTitle: string
  courseNum?: string
  classNum?: number
  rows: WorkItem[]
}

export type { GroupedRows, WorkItem }
