import type {
  Submission,
  UserData,
  JudgeResult,
  Leaderboard,
  ContestforStatistics,
  ContestProblemforStatistics
} from './types/type'

interface RankingState {
  userProblems: Record<
    string,
    Record<
      string,
      {
        problemId: string
        attempts: number
        solveTime: number | null
        judgeResult: JudgeResult
        problemPenalty: number
      }
    >
  >
  firstSolvers: Record<string, string>
  userInfo: Record<
    string, //유저id
    {
      userId: string
      userName: string
      problemsSolved: number
      totalPenalty: number
      lastSolvedTime: number
    }
  >
}
interface ProblemAccuracyRate {
  problem: Record<
    string,
    {
      attempts: number
      solves: number
      accuracyRate: number
    }
  >
}
interface CreateInitialStateProps {
  leaderboard: Leaderboard
  contestProblems: ContestProblemforStatistics
}

interface CalculateRankingHistoryProps {
  sortedSubmissions: Submission[]
  leaderboard: Leaderboard
  contestMetadata: ContestforStatistics
  contestProblems: ContestProblemforStatistics
}

interface CalculateProblemAccuracyRate {
  leaderboard: Leaderboard
  contestProblems: ContestProblemforStatistics
  sortedSubmissions: Submission[]
}

function createInitialState({
  leaderboard,
  contestProblems
}: CreateInitialStateProps): RankingState {
  const userProblems: RankingState['userProblems'] = {}
  const userInfo: RankingState['userInfo'] = {}

  for (const record of leaderboard.leaderboard) {
    const userId = record.userId
    userProblems[userId] = {}

    for (const problem of contestProblems.data) {
      userProblems[userId][problem.id] = {
        problemId: problem.id.toString(),
        attempts: 0,
        solveTime: null,
        judgeResult: 'NoAttempt',
        problemPenalty: 0
      }
    }

    userInfo[userId] = {
      userId: userId.toString(),
      userName: record.username,
      problemsSolved: 0,
      totalPenalty: 0,
      lastSolvedTime: 0
    }
  }

  return {
    userProblems,
    firstSolvers: {},
    userInfo
  }
}

function reflectSubmissionToState(
  state: RankingState,
  submission: Submission,
  contestMetadata: ContestforStatistics
): void {
  const contestStartTime = new Date(contestMetadata.startTime).getTime()
  const userId = submission.userId.toString()

  if (!userId || !state.userProblems[userId]) {
    return
  }
  const problemId = submission.problemId
  const problem = state.userProblems[userId][problemId]

  if (!problem) {
    return
  }
  if (problem.solveTime !== null) {
    //problem.judgeResult = submission.result as JudgeResult
    return
  }

  problem.attempts += 1
  problem.judgeResult = submission.result as JudgeResult
  if (submission.result === 'Accepted') {
    const solveTime = new Date(submission.createTime).getTime()
    problem.solveTime = solveTime

    if (!state.firstSolvers[problemId]) {
      state.firstSolvers[problemId] = userId.toString()
    }

    state.userInfo[userId].problemsSolved += 1

    const timePenaltyMinutes = Math.floor(
      (solveTime - contestStartTime) / 60000
    )
    const attemptsPenalty = (problem.attempts - 1) * 20
    const problemPenalty = timePenaltyMinutes + attemptsPenalty
    state.userProblems[userId][problemId].problemPenalty = problemPenalty
    state.userInfo[userId].totalPenalty += problemPenalty

    if (solveTime > state.userInfo[userId].lastSolvedTime) {
      state.userInfo[userId].lastSolvedTime = solveTime
    }
  }
}

function generateUsersFromState(state: RankingState): UserData[] {
  const users: UserData[] = Object.values(state.userInfo).map((info) => {
    const userId = parseInt(info.userId)
    const problemDetails = state.userProblems[userId]

    return {
      userRank: 0,
      userId: info.userId,
      userName: info.userName,
      problemsSolved: info.problemsSolved,
      totalPenalty: info.totalPenalty,
      problemDetails: Object.entries(problemDetails).reduce(
        (acc, [pid, detail]) => {
          acc[pid] = {
            problemId: detail.problemId,
            attempts: detail.attempts,
            solveTime: detail.solveTime,
            judgeResult: detail.judgeResult,
            penalty: detail.problemPenalty
          }
          return acc
        },
        {} as Record<
          string,
          {
            problemId: string
            attempts: number
            solveTime: number | null
            judgeResult: JudgeResult
            penalty: number
          }
        >
      ),
      isMyUser: false
    }
  })
  users.sort((a, b) => {
    if (b.problemsSolved !== a.problemsSolved) {
      return b.problemsSolved - a.problemsSolved
    }
    if (a.totalPenalty !== b.totalPenalty) {
      return a.totalPenalty - b.totalPenalty
    }
    const lastSolvedTimeA =
      state.userInfo[parseInt(a.userId)].lastSolvedTime || Infinity
    const lastSolvedTimeB =
      state.userInfo[parseInt(b.userId)].lastSolvedTime || Infinity
    return lastSolvedTimeA - lastSolvedTimeB
  })

  let currentRank = 1
  for (let i = 0; i < users.length; i++) {
    users[i].userRank = currentRank++
  }

  return users
}

export function calculateRankingHistory({
  sortedSubmissions,
  leaderboard,
  contestMetadata,
  contestProblems
}: CalculateRankingHistoryProps) {
  const state = createInitialState({ leaderboard, contestProblems })
  const history: Array<{
    submissionIndex: number
    timestamp: number
    users: UserData[]
    firstSolvers: Record<string, string>
  }> = []

  for (let i = 0; i < sortedSubmissions.length; i++) {
    const submission = sortedSubmissions[i]

    reflectSubmissionToState(state, submission, contestMetadata)

    const users = generateUsersFromState(state)
    const firstSolvers = { ...state.firstSolvers }

    history.push({
      submissionIndex: i,
      timestamp: parseInt(submission.createTime),
      users,
      firstSolvers
    })
  }

  return history
}

export function calculateProblemAccuracyRate({
  leaderboard,
  contestProblems,
  sortedSubmissions
}: CalculateProblemAccuracyRate): ProblemAccuracyRate {
  // 대회 중 부정행위 등으로 인해 리더보드에서 사라진 사용자의 제출은 무시
  const validUsers = new Set<number>(
    leaderboard.leaderboard.map((u) => u.userId)
  )

  const attemptedUsers: Record<string, Set<number>> = {}
  const solvedUsers: Record<string, Set<number>> = {}

  for (const problem of contestProblems.data) {
    attemptedUsers[problem.id] = new Set()
    solvedUsers[problem.id] = new Set()
  }

  for (const sub of sortedSubmissions) {
    const pid = sub.problemId
    const uid = sub.userId

    if (!attemptedUsers[pid]) {
      continue
    }
    if (!validUsers.has(uid)) {
      continue
    }

    attemptedUsers[pid].add(uid)

    if (sub.result === 'Accepted') {
      solvedUsers[pid].add(uid)
    }
  }

  const problemStats: ProblemAccuracyRate['problem'] = {}

  for (const problem of contestProblems.data) {
    const attempts = attemptedUsers[problem.id].size
    const solves = solvedUsers[problem.id].size

    problemStats[problem.id] = {
      attempts,
      solves,
      accuracyRate: attempts === 0 ? 0 : solves / attempts
    }
  }

  return {
    problem: problemStats
  }
}

export function calculateWeightedAccuracy(stats: ProblemAccuracyRate) {
  let totalAttempts = 0
  let totalSolves = 0

  for (const p of Object.values(stats.problem)) {
    totalAttempts += p.attempts
    totalSolves += p.solves
  }

  return totalAttempts === 0 ? 0 : totalSolves / totalAttempts
}
