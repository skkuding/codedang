import type { UpdateContestInput } from '@generated/graphql'

export type ContestStatus =
  | 'ongoing'
  | 'upcoming'
  | 'finished'
  | 'registeredOngoing'
  | 'registeredUpcoming'

export type AssignmentStatus = 'ongoing' | 'upcoming' | 'finished'

export type RecentUpdateType = 'Assignment' | 'Grade' | 'QnA' | 'Exam'

export type CourseStatus = 'ongoing' | 'finished'

export type Level = 'Level1' | 'Level2' | 'Level3' | 'Level4' | 'Level5'

export type SemesterSeason = 'Spring' | 'Summer' | 'Fall' | 'Winter'

export type Language = 'C' | 'Cpp' | 'Java' | 'Python3' | 'PyPy3'
// Problem type definition

export type MemberRole = 'Instructor' | 'Student'

export type SubmissionResult = 'CompileError' | 'WrongAnswer' | 'Accepted'
export interface Tag {
  id: number
  name: string
}

export interface User {
  username: string
  role: string
  email: string
  lastLogin: string
  updateTime: string
  studentId: string
  major: string
  userProfile: {
    realName: string
  }
  canCreateContest: boolean
  canCreateCourse: boolean
}
export interface Snippet {
  id: number
  locked: boolean
  text: string
}

export interface ZipUploadedTestcase {
  id: number | null
  input: string
  output: string
  isHidden: boolean
  scoreWeight: number | null
  scoreWeightNumerator?: number | null
  scoreWeightDenominator?: number | null
  isZipUploaded: true
  zipKey: string
}

export interface Template {
  code: Snippet[]
  language: Language
}

export interface Solution {
  code: string
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

export interface ProblemDataTop {
  data: {
    order: number
    id: number | string
    title: string
    difficulty: string
    submissionCount: number
    acceptedRate: number
    maxScore: number
    score: null | number
    submissionTime: null | string
  }[]
  total: number
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
  maxScore: number | null
  score: string | null
  submissionTime: string | null
  acceptedRate: number
}

export interface TestcaseItem {
  id: number
  input: string
  output: string
  isHidden?: boolean
  order?: number
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
  solution: Solution[]
  difficulty: Level
  order?: number
}

// Contest type definition

interface ProblemInContestInterface {
  order: number
  problem: {
    title: string
  }
}
export interface Contest {
  id: number
  title: string
  startTime: Date
  endTime: Date
  registerDueTime: Date
  createTime: Date
  summary: {
    문제형태?: string
    순위산정?: string
    진행방식?: string
    참여대상?: string
    참여혜택?: string
  }
  isJudgeResultVisible: boolean
  enableCopyPaste: boolean
  status: ContestStatus
  participants: number
  freezeTime?: Date
  isRegistered: boolean
  contestProblem: ProblemInContestInterface[]
}

export interface ContestTop {
  id: number
  title: string
  description: string
  startTime: Date
  endTime: Date
  registerDueTime: Date
  createTime: Date
  isJudgeResultVisible: boolean
  posterUrl?: string
  summary: {
    문제형태?: string
    순위산정?: string
    진행방식?: string
    참여대상?: string
    참여혜택?: string
  }
  enableCopyPaste: boolean
  status: ContestStatus
  participants: number
  isRegistered: boolean
  isPrivilegedRole: boolean
  invitationCodeExists: boolean
  prev: null | {
    id: number
    title: string
  }
  next: null | {
    id: number
    title: string
  }
}

export interface ContestOrder {
  id: number
  title: string
}

export interface ContestAnnouncement {
  id: number
  content: string
  constestId: number
  problemOrder: null | number
  createTime: string
  updateTime: string
}

export interface ContestPreview {
  id: number
  title: string
  startTime: Date
  endTime: Date
  registerDueTime: Date
  createTime: Date
  summary: {
    문제형태?: string
    순위산정?: string
    진행방식?: string
    참여대상?: string
    참여혜택?: string
  }
  description: string
  posterUrl: string
  status: ContestStatus
  problems: {
    order: number
    id: number | string
    title: string
    difficulty: string
    submissionCount: number
    acceptedRate: number
    score: null | number
  }[]
}

export interface ContestProblemforStatistics {
  problemId: number
  problem: {
    title: string
  }
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
  order: string
  user: {
    username: string
  }
  createTime: string
  language: string
  result: string
  codeSize: number
  problemId: number
  problem: {
    title: string
  }
}

export interface SubmissionDetail {
  problemId: number
  username: string
  code: string
  codeSize?: string
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
    problemTestcase?: {
      isHidden: boolean
    }
  }[]
}
export interface ContestSubmission {
  data: SubmissionItem[]
  total: number
}

interface LeaderboardProblemRecord {
  score: number
  order: number
  problemId: number
  penalty: number
  submissionCount: number
}
interface UserOnLeaderboard {
  username: string
  score: number
  finalScore: number
  totalPenalty: number
  finalTotalPenalty: number
  problemRecords: LeaderboardProblemRecord[]
  rank: number
}
export interface Leaderboard {
  maxscore: number
  leaderboard: UserOnLeaderboard[]
}
export interface LeaderboardItemCodeEditorPagination {
  id: number
  rank: number
  userId: string
  penalty: number
  solved: string
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
  type: 'user' | 'sample' | 'hidden'
  isHidden?: boolean
}

export interface TabbedTestResult extends TestResultDetail {
  originalId: number
}

export interface SettingsFormat {
  currentPassword: string
  newPassword: string
  confirmPassword: string
  realName: string
  studentId: string
  email: string
}

export interface CourseInfo {
  groupId: number
  courseNum: string
  classNum: number
  professor: string
  semester: string
  email: string
  website: string
  office: string | null
  phoneNum: string | null
  week: number
}

export interface Course {
  id: number
  groupName: string
  description: string
  courseInfo: CourseInfo
  isGroupLeader: boolean
  isJoined: boolean
}

export type JoinedCourse = Omit<Course, 'isJoined'> & {
  memberNum: number
}

export interface CourseNotice {
  id: number
  title: string
  date: Date
  isNew: boolean
}

export interface CourseRecentUpdate {
  id: number
  title: string
  type: RecentUpdateType
  isNew: boolean
}

export interface Assignment {
  id: number
  title: string
  startTime: Date
  endTime: Date
  dueTime?: Date
  group: {
    id: string
    groupName: string
  }
  enableCopyPaste: boolean
  isJudgeResultVisible: boolean
  week: number
  status: AssignmentStatus
  description: string
  isRegistered: boolean
  problemCount: number
  submittedCount: number
  isExercise: boolean
}

export interface AssignmentProblem {
  id: number
  title: number
  difficulty: Level
  order: number
  submissionCount: number
  maxScore: number | null
  score: string | null
  submissionTime: string | null
  acceptedRate: number
}

export interface CalendarAssignment {
  title: string
  start: Date
  end: Date
}

export interface AssignmentProblemRecord {
  id: number
  autoFinalizeScore: boolean
  isFinalScoreVisible: boolean
  isJudgeResultVisible: boolean
  userAssignmentFinalScore: number | null
  userAssignmentJudgeScore: number | null
  assignmentPerfectScore: number
  comment: string | null
  problems: ProblemGrade[]
}
export interface ProblemGrade {
  id: number
  title: string
  order: number
  maxScore: number
  problemRecord: ProblemRecord | null
}

export interface ProblemRecord {
  finalScore: number
  score: number
  isSubmitted: boolean
  comment: string
}

export interface RunnerMessage {
  type: RunnerMessageType
  language: Language
  source: string
}

export enum RunnerMessageType {
  INPUT = 'input',
  CODE = 'code',
  COMPILE_SUCCESS = 'compile_success',
  COMPILE_ERR = 'compile_error',
  ECHO = 'echo',
  STDOUT = 'stdout',
  STDERR = 'stderr',
  EXIT = 'exit'
}

export interface AssignmentSummary {
  id: number
  problemCount: number
  submittedCount: number
  assignmentPerfectScore: number
  userAssignmentFinalScore: number | null
  userAssignmentJudgeScore: number
}

export interface AssignmentSubmission {
  problemId: number
  submission: ProblemSubmission | null
}

export interface ProblemSubmission {
  submissionTime: string
  submissionResult: string
  testcaseCount: number
  acceptedTestcaseCount: number
}

export interface UpdateContestInfo extends UpdateContestInput {
  contestRecord?: {
    userId: number
    user: {
      username: string
      email: string
    }
  }[]
}

export interface BaseDataTableProblem {
  id: number
  title: string
  updateTime: string
  difficulty: string
  submissionCount: number
  acceptedRate: number
  languages: string[]
  score?: number
  order?: number
}

export interface Notification {
  id: number
  notificationId: number
  title: string
  message: string
  url: string | null
  type: string
  isRead: boolean
  createTime: string
}

export interface MultipleQnaData {
  id: number
  order: number
  createdById: number
  title: string
  isResolved: boolean
  category: string
  problemId: number | null
  createTime: Date
  createdBy: {
    username: string
  }
  isRead: boolean
}

export interface SingleQnaData {
  id: number
  order: number
  createdById: number
  title: string
  content: string
  problemId: number | null
  category: string
  isResolved: boolean
  createTime: Date
  readby: number[]
  comments: {
    id: number
    order: number
    createdById: number
    isContestStaff: false
    content: string
    contestQnAId: number
    createdTime: Date
    createdBy: {
      username: string
    }
  }[]
  createdBy: {
    username: string
  }
}

export interface QnaFormData {
  title: string
  content: string
  selectedProblem: string
  selectedProblemLabel: string
}

export interface ProblemOption {
  value: string
  label: string
}
