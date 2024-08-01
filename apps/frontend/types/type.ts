export type ContestStatus =
  | 'ongoing'
  | 'upcoming'
  | 'finished'
  | 'registeredOngoing'
  | 'registeredUpcoming'

export type Level = 'Level1' | 'Level2' | 'Level3' | 'Level4' | 'Level5'

export type Language = 'C' | 'Cpp' | 'Java' | 'Python3'
// Problem type definition

export interface Tag {
  id: number
  name: string
}

export interface Snippet {
  id: number
  locked: boolean
  text: string
}

export interface Template {
  code: Snippet[]
  language: Language
}

export interface Problem {
  id: number
  title: string
  difficulty: Level
  submissionCount: number
  acceptedRate: number
  tags?: Tag[]
  info?: string
}

/**
 * WorkbookProblem and ContestProblem are duplicated interfaces but they are used in different contexts so they are kept separate.
 * But you can merge them into a single interface if you have some reason to do so.
 **/

export interface WorkbookProblem extends Omit<Problem, 'tags' | 'info'> {
  order: number
}

export interface ContestProblem extends Omit<Problem, 'tags' | 'info'> {
  order: number
}

export interface ProblemDetail {
  id: number
  title: string
  description: string
  inputDescription: string
  outputDescription: string
  samples: {
    id: number
    input: string
    output: string
  }[]
  languages: Language[]
  timeLimit: number
  memoryLimit: number
  source: string
  tags: Tag[]
  hint: string
  template: string[]
}

// Contest type definition

export interface Contest {
  id: number
  title: string
  startTime: Date
  endTime: Date
  group: {
    id: string
    groupName: string
  }
  enableCopyPaste: boolean
  status: ContestStatus
  participants: number
}

export interface ContestAnnouncement {
  id: number
  content: string
  problemId: number
  createTime: string
  updateTime: string
}

export interface Standings {
  ranking: number
  userId: number
  problemScore: {
    problemId: number
    score: number
    time: string
  }[]
  solved: number
  totalScore: number
}

// Notice type definition

export interface Notice {
  id: number
  title: string
  createTime: string
  isFixed: boolean
  createdBy: string
}

// Submission type definition

export interface Submission {
  id: number
  userId: number
  problemId: number
  contestId: number | null
  workbookId: number | null
  code: {
    id: number
    text: string
    locked: boolean
  }[]
  language: string
  result: string
  createTime: string
  updateTime: string
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

export interface SubmissionDetail {
  problemId: number
  username: string
  code: string
  language: Language
  createTime: Date
  result: string
  testcaseResult: {
    id: number
    submissionId: number
    problemTestcaseId: number
    result: string
    cpuTime: string
    memoryUsage: number
    createTime: Date
    updateTime: Date
  }[]
}
