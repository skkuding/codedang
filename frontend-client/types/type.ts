export type ContestStatus = 'ongoing' | 'upcoming' | 'finished'
export type Level = 'Level1' | 'Level2' | 'Level3' | 'Level4' | 'Level5'

export interface Contest {
  id: number
  title: string
  startTime: Date
  endTime: Date
  group: { id: string; groupName: string }
  status: ContestStatus
}

export interface WorkbookProblem {
  order: number
  problemId: number
  title: string
  difficulty: Level
}

export interface Notice {
  id: number
  title: string
  createTime: string
  isFixed: boolean
  createdBy: string
}

export interface Problem {
  id: number
  title: string
  difficulty: Level
  submissionCount: number
  acceptedRate: number
  tags?: {
    id: number
    name: string
  }[]
  info?: string
}

export interface ProblemDetail {
  id: number
  title: string
  description: string
  inputDescription: string
  outputDescription: string
  inputExamples: string[]
  outputExamples: string[]
  languages: string[]
  timeLimit: number
  memoryLimit: number
  tags: {
    id: number
    name: string
  }[]
}
