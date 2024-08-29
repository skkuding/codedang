import ContestStatusTimeDiff from '@/components/ContestStatusTimeDiff'
import { fetcher } from '@/lib/utils'
import { dateFormatter } from '@/lib/utils'
import Calendar from '@/public/20_calendar.svg'
import CheckIcon from '@/public/check_blue.svg'
import type { Contest } from '@/types/type'
import Image from 'next/image'
import ContestTabs from '../_components/ContestTabs'

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
  const res = await fetcher.get(`contest/${contestId}`)
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

    return (
      <article>
        <header className="flex justify-between p-5 py-8">
          <div className="flex flex-col gap-3">
            <h2 className="break-words text-[28px] font-medium">
              {contest?.title}
            </h2>
            <div className="flex items-center gap-2">
              <Image src={CheckIcon} alt="check" width={24} height={24} />
              <p className="text-primary-light text-sm font-bold">
                Total score
              </p>
              <p className="text-primary-strong font-bold">100/100</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-4">
            <div className="flex gap-2">
              <Image src={Calendar} alt="calendar" width={24} height={24} />
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
