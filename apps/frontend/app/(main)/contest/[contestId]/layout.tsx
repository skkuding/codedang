import { fetcher, dateFormatter } from '@/lib/utils'
import type { Contest } from '@/types/type'
import { FaRegClock } from 'react-icons/fa'
import { FaRegCalendarAlt } from 'react-icons/fa'
import TimeDiff from '../../_components/TimeDiff'
import ContestTabs from '../_components/ContestTabs'

interface ContestDetailProps {
  params: {
    contestId: string
  }
}

const format = (target: Date, year: number): string =>
  new Date(target).getFullYear() === year
    ? dateFormatter(target, 'MMM DD')
    : dateFormatter(target, 'MMM DD,YYYY')

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
    const data: Contest = await res.json()
    const currentTime = new Date()
    const startTime = new Date(data.startTime)
    const endTime = new Date(data.endTime)

    if (currentTime < startTime) {
      data.status = 'upcoming'
    } else if (currentTime > endTime) {
      data.status = 'finished'
    } else {
      data.status = 'ongoing'
    }

    const year = new Date().getFullYear()
    const start = format(data.startTime, year)
    const end = format(data.endTime, year)

    return (
      <article>
        <header className="flex justify-between p-5 py-8">
          <h2 className="break-words text-2xl font-extrabold">{data.title}</h2>
          {data.status === 'finished' && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <p>Finished</p>
              <FaRegCalendarAlt className="shrink-0" />
              <p>
                {start} - {end}
              </p>
            </div>
          )}
          {data.status === 'ongoing' && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <p>Ongoing</p>
              <FaRegClock className="shrink-0" />
              <p className="text-red-500">
                <TimeDiff timeRef={data.endTime}></TimeDiff>
              </p>
            </div>
          )}
          {data.status === 'upcoming' && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <p>Upcoming</p>
              <FaRegClock className="shrink-0" />
              <TimeDiff timeRef={data.startTime}></TimeDiff>
            </div>
          )}
        </header>
        <ContestTabs contestId={contestId} />
        {tabs}
      </article>
    )
  }
  return <p className="text-center">No Results.</p>
}
