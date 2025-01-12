import { getContestProblemList } from '@/app/(client)/_libs/apis/contestProblem'

const calculateContestScore = async ({ contestId }: { contestId: string }) => {
  try {
    const contestProblems = await getContestProblemList({
      contestId: Number(contestId)
    })

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
