import { safeFetcherWithAuth } from '@/lib/utils'
import type { ContestProblem } from '@/types/type'

interface ContestProblemsApiRes {
  data: ContestProblem[]
}

const calculateContestScore = async ({ contestId }: { contestId: string }) => {
  try {
    const contestProblems: ContestProblemsApiRes = await safeFetcherWithAuth
      .get(`contest/${contestId}/problem`)
      .json()

    const { totalScore, totalMaxScore } = contestProblems.data.reduce(
      (acc, curr) => {
        const score = curr.score ? parseInt(curr.score, 10) : 0
        const maxScore = curr.maxScore || 0

        acc.totalScore += score
        acc.totalMaxScore += maxScore

        return acc
      },
      { totalScore: 0, totalMaxScore: 0 }
    )
    return [totalScore, totalMaxScore]
  } catch (error) {
    return [0, 0]
  }
}

export { calculateContestScore }
