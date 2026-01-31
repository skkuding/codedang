export type JudgeResult =
  | 'Accepted'
  | 'WrongAnswer'
  | 'TimeLimitExceeded'
  | 'MemoryLimitExceeded'
  | 'RuntimeError'
  | 'CompileError'
  | 'ServerError'
  | 'NoAttempt'

export interface ProblemDetail {
  problemId: string
  attempts: number
  solveTime: number | null
  judgeResult: JudgeResult
  penalty: number | null
} //문제마다의 패널티도 저장하기

export interface ContestforStatistics {
  id: number
  title: string
  startTime: string
  endTime: string
}
export interface ContestProblemforStatistics {
  data: {
    id: number
    order: number
    title: string
  }[]
}

export interface UserData {
  userRank: number
  userId: string
  userName: string
  problemsSolved: number
  totalPenalty: number
  problemDetails: Record<string, ProblemDetail>
}

export interface Submission {
  id: number
  title: string
  username: string
  userId: number
  result: string
  language: string
  createTime: string
  codeSize: number
  problemId: number
  order: number
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
  userId: number
  totalScore: number
  totalPenalty: number
  problemRecords: LeaderboardProblemRecord[]
  rank: number
}
export interface Leaderboard {
  maxScore: number
  leaderboard: UserOnLeaderboard[]
}
