export type ContestStatus = 'ongoing' | 'upcoming' | 'finished'
export type Level = 'Level1' | 'Level2' | 'Level3' | 'Level4' | 'Level5'
export type Language = 'C' | 'Cpp' | 'Golang' | 'Java' | 'Python2' | 'Python3'

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
  totalScore: number
}

export interface ContestProblem {
  id: number
  order: number
  problemId: number
  title: string
  difficulty: Level
  submissionCount: number
  acceptedRate: number
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
  hint: string
}

export interface SubmissionItem {
  id: number
  user: {
    username: string
  }
  createTime: string
  language: string
  result: string
  codeSize: number
}

export interface Submission {
  id: number
  userId: number
  problemId: number
  contestId: number | null
  workbookId: number | null
  code: { id: number; text: string; lockded: boolean }[]
  language: string
  result: string
  createTime: string
  updateTime: string
}

export interface SubmissionDetail {
  problemId: number
  username: string
  code: string
  language: string
  createTime: string
  result: string
  testcaseResult: {
    id: number
    submissionId: number
    problemTestCaseId: number
    result: string
    cpuTime: string
    memoryUsage: number
    createTime: string
    updateTime: string
  }[]
}

export interface ContestClarification {
  id: number
  content: string
  problemId: number
  createTime: string
  updateTime: string
}

export interface Tag {
  id: number
  name: string
}

export interface Sample {
  input: string
  output: string
}

export interface Testcase {
  input: string
  output: string
  scoreWeight?: number
}

export interface Snippet {
  id: number
  text: string
  locked: boolean
}

export interface Template {
  language: Language
  code: Snippet[]
}
