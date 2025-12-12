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
    string, //사용자 id? 사용자마다의 각 문제가 어떤 상태인지 담긴 객체
    Record<
      string, //얜 뭘까 problemId?
      {
        problemId: string
        attempts: number
        solveTime: number | null
        judgeResult: JudgeResult
        problemPenalty: number
        //패널티도 여기에 추가하면 될듯?
      }
    >
  >
  firstSolvers: Record<string, string> //문제 1번은 사용자 103가 최초로, 문제 2번은 사용자 104가...
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

function createInitialState({
  leaderboard,
  contestProblems
}: CreateInitialStateProps): RankingState {
  const userProblems: RankingState['userProblems'] = {} //RankingState에서 userProblems 타입을 가져와서 초기화
  const userInfo: RankingState['userInfo'] = {}

  for (const record of leaderboard.leaderboard) {
    //userid
    //유저마다
    const userId = record.userId
    userProblems[userId] = {}

    for (const problem of contestProblems.contestProblem) {
      //problem id
      //또 problem 마다
      userProblems[userId][problem.problemId] = {
        problemId: problem.problemId.toString(),
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

function reflectSubmissionToState( //하나의 submission 들어올 때마다 state 업데이트
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
  //이미 맞힌 문제에 대한 추가 제출은 기록만 업데이트하고 순위/페널티에 영향 없음
  if (problem.solveTime !== null) {
    problem.judgeResult = submission.result as JudgeResult
    return
  }

  problem.attempts += 1
  problem.judgeResult = submission.result as JudgeResult
  //틀린 경우에는 패널티 계산 안함.
  if (submission.result === 'Accepted') {
    //problem 업데이트
    const solveTime = parseInt(submission.submissionTime)
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
  //reflect 한 후 state를 바탕으로 순위 다시 계산
  const users: UserData[] = Object.values(state.userInfo).map((info) => {
    //RankingState의 userInfo를 UserData 형태로 변환
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
          //[pid, detail] 은 ["P1", { attempts: 3, solveTime: 12345, ... }] 구조분해할당
          acc[pid] = {
            //키값
            problemId: detail.problemId,
            attempts: detail.attempts,
            solveTime: detail.solveTime,
            judgeResult: detail.judgeResult,
            penalty: detail.problemPenalty
          }
          return acc
        },
        //초깃값은 빈 객체
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
  //users: UserData[] 정렬. 이제야 리더보드의 순위가 매겨짐.!
  users.sort((a, b) => {
    if (b.problemsSolved !== a.problemsSolved) {
      return b.problemsSolved - a.problemsSolved //푼 문제 수 많은 사람이 우선
    }
    if (a.totalPenalty !== b.totalPenalty) {
      return a.totalPenalty - b.totalPenalty //페널티 적은 사람이 우선
    }
    const lastSolvedTimeA =
      state.userInfo[parseInt(a.userId)].lastSolvedTime || Infinity
    const lastSolvedTimeB =
      state.userInfo[parseInt(b.userId)].lastSolvedTime || Infinity
    return lastSolvedTimeA - lastSolvedTimeB //마지막 정답 제출 시간이 빠른 사람이 우선
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
  const state = createInitialState({ leaderboard, contestProblems }) //초기 상태 생성
  const history: Array<{
    submissionIndex: number
    timestamp: number
    users: UserData[] //모든 유저 정보들이 담긴 배열
    firstSolvers: Record<string, string>
  }> = []

  for (let i = 0; i < sortedSubmissions.length; i++) {
    //제출마다 수행
    const submission = sortedSubmissions[i]

    reflectSubmissionToState(state, submission, contestMetadata) //제출 반영하여 상태 업데이트

    const users = generateUsersFromState(state) //리더보드 순위대로 정렬된 유저 배열 생성됨.
    const firstSolvers = { ...state.firstSolvers }

    history.push({
      submissionIndex: i,
      timestamp: parseInt(submission.submissionTime),
      users,
      firstSolvers
    })
  }

  return history //히스토리에 제출 하나마다의 리더보드 상태 추가됨.
}
