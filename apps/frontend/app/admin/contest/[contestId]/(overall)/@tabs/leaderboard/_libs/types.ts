export interface ProblemRecordInContestLeaderboard {
  order: number
  problemId: number
  score: number
  penalty: number
  submissionCount: number
  isFirstSolver: boolean
}

export interface LeaderboardUser {
  rank: number
  userId: number
  username: string
  finalScore: number
  finalTotalPenalty: number
  problemRecords: ProblemRecordInContestLeaderboard[]
}

export interface ContestLeaderboard {
  maxScore: number
  participatedNum: number
  registeredNum: number
  isFrozen: boolean
  leaderboard: LeaderboardUser[]
}
