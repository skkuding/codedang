import { getContest } from '../leaderboard/_libs/apis/getContest'
import { getContestLeaderboard } from '../leaderboard/_libs/apis/getContestLeaderboard'
import { StatisticsPage } from './_components/StatisticsPage'

interface ContestStatisticsProps {
  params: Promise<{
    contestId: string
  }>
}

export default async function ContestStatistics(props: ContestStatisticsProps) {
  const { contestId } = await props.params

  // If contest is not finished or has frozen records, throw error to show error.tsx
  const [contestLeaderboard, contest] = await Promise.all([
    getContestLeaderboard({
      contestId: parseInt(contestId)
    }),
    getContest({ contestId: parseInt(contestId) })
  ])
  if (new Date(contest.endTime) > new Date()) {
    throw new Error('Contest not finished')
  }

  // TODO: should change to check if the contest is frozen, not problem records (inefficient implementation)
  const hasFrozenRecords = contestLeaderboard.leaderboard.some((user) =>
    user.problemRecords.some((record) => record.isFrozen)
  )

  if (hasFrozenRecords) {
    throw new Error('Leaderboard has frozen records')
  }
  return <StatisticsPage />
}
