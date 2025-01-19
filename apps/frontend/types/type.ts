import type { StringDecoder } from 'string_decoder'

export type ContestStatus =
  | 'ongoing'
  | 'upcoming'
  | 'finished'
  | 'registeredOngoing'
  | 'registeredUpcoming'

export type AssignmentStatus =
  | 'ongoing'
  | 'upcoming'
  | 'finished'
  | 'registeredOngoing'
  | 'registeredUpcoming'

export type CourseStatus = 'ongoing' | 'finished'

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
  tags: Tag[]
  languages: Language[]
  hasPassed: boolean | null
}

/**
 * WorkbookProblem and ContestProblem are duplicated interfaces but they are used in different contexts so they are kept separate.
 * But you can merge them into a single interface if you have some reason to do so.
 **/

export interface WorkbookProblem extends Omit<Problem, 'tags' | 'info'> {
  order: number
}

export interface ContestProblem {
  id: number
  title: number
  difficulty: Level
  order: number
  submissionCount: number
  maxScore: number
  score: string | null
  submissionTime: string | null
  acceptedRate: number
}

export interface TestcaseItem {
  id: number
  input: string
  output: string
}

export interface ProblemDetail {
  id: number
  title: string
  description: string
  inputDescription: string
  outputDescription: string
  problemTestcase: TestcaseItem[]
  languages: Language[]
  timeLimit: number
  memoryLimit: number
  source: string
  tags: Tag[]
  hint: string
  template: string[]
  difficulty: Level
  order?: number
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
  isJudgeResultVisible: boolean
  enableCopyPaste: boolean
  status: ContestStatus
  participants: number
  isRegistered: boolean
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

// Test type definition

export interface TestResult {
  id: number
  output: string
  result: string
}

export interface TestResultDetail extends TestResult {
  input: string
  expectedOutput: string
  isUserTestcase: boolean
  originalId: number
}

export interface SettingsFormat {
  currentPassword: string
  newPassword: string
  confirmPassword: string
  realName: string
  studentId: string
}

export interface RawCourse {
  id: number
  groupName: string
  description: string
  memberNum: number
  isGroupLeader: boolean
}

export interface Course {
  id: number
  groupName: string
  description: string
  memberNum: number
  status: CourseStatus
  semester: string
  professor: string
}

export interface Assignment {
  id: number
  title: string
  startTime: Date
  endTime: Date
  group: {
    id: string
    groupName: string
  }
  isJudgeResultVisible: boolean
  enableCopyPaste: boolean
  status: AssignmentStatus
  participants: number
  isRegistered: boolean
}

export interface CalendarAssignment {
  title: string
  start: string
  end: string
}

export interface CalendarAssignmentEvent {
  event: {
    id: number
    title: string
    start: string
    end: string
  }
}
