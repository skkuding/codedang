import { getContest } from '../leaderboard/_libs/apis/getContest'
import { getContestLeaderboard } from '../leaderboard/_libs/apis/getContestLeaderboard'
import { StatisticsClientLayout } from './_layout-client'

interface LayoutProps {
  children: React.ReactNode
  params: {
    contestId: string
  }
}

export default async function StatisticsLayout({
  children,
  params
}: LayoutProps) {
  const contestId = parseInt(params.contestId)

  const [contestLeaderboard, contest] = await Promise.all([
    getContestLeaderboard({ contestId }),
    getContest({ contestId })
  ])

  if (new Date(contest.endTime) > new Date()) {
    throw new Error('Contest not finished')
  }

  const hasFrozenRecords = contestLeaderboard.leaderboard.some((user) =>
    user.problemRecords.some((record) => record.isFrozen)
  )

  if (hasFrozenRecords) {
    throw new Error('Leaderboard has frozen records')
  }

  return <StatisticsClientLayout>{children}</StatisticsClientLayout>
}
