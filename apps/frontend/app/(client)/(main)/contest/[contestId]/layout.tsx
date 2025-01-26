import { auth } from '@/libs/auth'
import { fetcher, fetcherWithAuth, getStatusWithStartEnd } from '@/libs/utils'
import { dateFormatter } from '@/libs/utils'
import type { Contest } from '@/types/type'
import { ContestTabs } from '../_components/ContestTabs'
import { calculateContestScore } from './_libs/utils'

interface ContestDetailProps {
  params: {
    contestId: string
  }
  tabs: React.ReactNode
}

export default async function Layout({ params, tabs }: ContestDetailProps) {
  const { contestId } = params
  const session = await auth()

  const res = await (session ? fetcherWithAuth : fetcher).get(
    `contest/${contestId}`
  )
  if (res.ok) {
    const contest: Contest = await res.json()
    const formattedStartTime = dateFormatter(
      contest.startTime,
      'YYYY-MM-DD HH:mm:ss'
    )
    const formattedEndTime = dateFormatter(
      contest.endTime,
      'YYYY-MM-DD HH:mm:ss'
    )
    const isJudgeResultVisible = contest.isJudgeResultVisible
    const isRegistered = contest.isRegistered
    const contestStatus = getStatusWithStartEnd(
      formattedStartTime,
      formattedEndTime
    )

    let totalScore = 0
    let totalMaxScore = 0
    if (isRegistered && isJudgeResultVisible && contestStatus !== 'upcoming') {
      const [score, maxScore] = await calculateContestScore({ contestId })
      totalScore = score
      totalMaxScore = maxScore
    }

    return (
      <article>
        <ContestTabs contestId={contestId} />
        {tabs}
      </article>
    )
  }
  return <p className="text-center">No Results.</p>
}
