import { safeFetcherWithAuth } from '@/libs/utils'

interface GetContestLeaderboard {
  contestId: number
}

export interface ProblemRecordInContestLeaderboard {
  order: number
  problemId: number
  penalty: number
  submissionCount: number
  score: number
  isFrozen: boolean
  isFirstSolver: boolean
}

export interface LeaderboardUser {
  username: string
  totalScore: number
  totalPenalty: number
  problemRecords: ProblemRecordInContestLeaderboard[]
  rank: number
}

export interface ContestLeaderboard {
  maxScore: number
  leaderboard: LeaderboardUser[]
  contestRole: string
}

export const getContestLeaderboard = async ({
  contestId
}: GetContestLeaderboard) => {
  const response = await safeFetcherWithAuth.get(
    `contest/${contestId}/leaderboard`
  )

  const data = await response.json<ContestLeaderboard>()
  return data
}
