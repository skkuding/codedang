import { gql } from '@generated'

const GET_CONTEST_LEADERBOARD = gql(`
  query GetContestLeaderboard($contestId: Int!) {
    getContestLeaderboard(contestId: $contestId) {
      maxScore
      participatedNum
      registeredNum
      isFrozen
      leaderboard {
        rank
        userId
        username
        finalScore
        finalTotalPenalty
        problemRecords {
          order
          problemId
          score
          penalty
          submissionCount
          isFirstSolver
        }
      }
    }
  }
`)

export { GET_CONTEST_LEADERBOARD }
