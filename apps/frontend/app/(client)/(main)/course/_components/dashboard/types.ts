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
}

interface GroupedRows {
  courseId: number
  courseTitle: string
  rows: WorkItem[]
}

export type { GroupedRows, WorkItem }
