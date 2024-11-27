import { safeGetContestDetail } from '@/app/(client)/_libs/apis/contest'
import { isErrorResponse } from '@/app/(client)/_libs/apis/utils'
import ContestStatusTimeDiff from '@/components/ContestStatusTimeDiff'
import { dateFormatter, getStatusWithStartEnd } from '@/libs/utils'
import calendarIcon from '@/public/icons/calendar.svg'
import checkIcon from '@/public/icons/check-blue.svg'
import Image from 'next/image'
import { calculateContestScore } from '../_libs/utils'

interface ContestDetailHeaderProps {
  contestId: string
}

export async function ContestDetailHeader({
  contestId
}: ContestDetailHeaderProps) {
  const contest = await safeGetContestDetail({ contestId: Number(contestId) })

  if (isErrorResponse(contest)) {
    return null
  }

  const formattedStartTime = dateFormatter(
    contest.startTime,
    'YYYY-MM-DD HH:mm:ss'
  )
  const formattedEndTime = dateFormatter(contest.endTime, 'YYYY-MM-DD HH:mm:ss')
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
  )
}
