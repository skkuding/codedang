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

interface ProblemScore {
  problemId: number
  score: number
  time: string
}
export interface Standings {
  ranking: number
  userId: number
  problemScore: ProblemScore[]
  solved: number
  score: number
}
