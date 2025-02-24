export type ContestStatus =
  | 'ongoing'
  | 'upcoming'
  | 'finished'
  | 'registeredOngoing'
  | 'registeredUpcoming'

// TODO: registeredOngoing registeredUpcoming 삭제하기
export type AssignmentStatus =
  | 'ongoing'
  | 'upcoming'
  | 'finished'
  | 'registeredOngoing'
  | 'registeredUpcoming'

export type RecentUpdateType = 'Assignment' | 'Grade' | 'QnA' | 'Exam'

export type CourseStatus = 'ongoing' | 'finished'

export type Level = 'Level1' | 'Level2' | 'Level3' | 'Level4' | 'Level5'

export type SemesterSeason = 'Spring' | 'Summer' | 'Fall' | 'Winter'

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
  group: {
    id: number
    groupName: string
  }
  isJudgeResultVisible: boolean
  enableCopyPaste: boolean
  status: ContestStatus
  participants: number
  isRegistered: boolean
  contestProblem: ProblemInContestInterface[]
}

export interface ContestAnnouncement {
  id: number
  content: string
  assignmentId: null | string
  constestId: number
  problemId: null | number
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
  user: { username: string }
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
  group: {
    id: string
    groupName: string
  }
  enableCopyPaste: boolean
  isJudgeResultVisible: boolean
  week: number
  status: AssignmentStatus
  description: string
  invitationCodeExists: boolean
  isRegistered: boolean
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
