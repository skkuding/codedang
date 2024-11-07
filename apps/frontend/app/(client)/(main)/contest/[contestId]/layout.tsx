import ContestStatusTimeDiff from '@/components/ContestStatusTimeDiff'
import { auth } from '@/lib/auth'
import { fetcher, fetcherWithAuth, getStatusWithStartEnd } from '@/lib/utils'
import { dateFormatter } from '@/lib/utils'
import calendarIcon from '@/public/icons/calendar.svg'
import checkIcon from '@/public/icons/check-blue.svg'
import type { Contest } from '@/types/type'
import Image from 'next/image'
import ContestTabs from '../_components/ContestTabs'
import { calculateContestScore } from './_libs/utils'

interface ContestDetailProps {
  params: {
    contestId: string
  }
}

export default async function Layout({
  params,
  tabs
}: {
  params: ContestDetailProps['params']
  tabs: React.ReactNode
}) {
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
        <header className="flex justify-between p-5 py-8">
          <div className="flex flex-col gap-3">
            <h2 className="break-words text-[28px] font-medium">
              {contest?.title}
            </h2>
            <div className="flex items-center gap-2">
              {isRegistered && contestStatus !== 'upcoming' && (
                <>
                  <Image src={checkIcon} alt="check" width={24} height={24} />
                  <p className="text-primary-light text-sm font-bold">
                    Total score
                  </p>
                  <p className="text-primary-strong font-bold">
                    {isJudgeResultVisible
                      ? `${totalScore} / ${totalMaxScore}`
                      : '-'}
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-4">
            <div className="flex gap-2">
              <Image src={calendarIcon} alt="calendar" width={24} height={24} />
              <p className="font-medium text-[#333333]">
                {formattedStartTime} ~ {formattedEndTime}
              </p>
            </div>
            <ContestStatusTimeDiff
              contest={contest}
              textStyle="text-netural-900 font-medium"
              inContestEditor={false}
            />
          </div>
        </header>
        <ContestTabs contestId={contestId} />
        {tabs}
      </article>
    )
  }
  return <p className="text-center">No Results.</p>
}
