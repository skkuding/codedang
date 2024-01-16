import { fetcher } from '@/lib/utils'
import dayjs from 'dayjs'
import { FaRegClock } from 'react-icons/fa'
import { FaRegCalendarAlt } from 'react-icons/fa'
import TimeDiff from '../../_components/TimeDiff'

export interface ContestDetailProps {
  params: {
    id: string
  }
}

const format = (target: Date, year: number): string =>
  new Date(target).getFullYear() === year
    ? dayjs(target).format('MMM DD')
    : dayjs(target).format('MMM DD, YYYY')

export default async function Layout({
  params,
  tabs
}: {
  params: ContestDetailProps['params']
  tabs: React.ReactNode
}) {
  const { id } = params
  const contest = await fetcher.get(`contest/${id}`).json()

  const currentTime = new Date()
  const startTime = new Date(contest.startTime)
  const endTime = new Date(contest.endTime)

  if (currentTime < startTime) {
    contest.status = 'upcoming'
  } else if (currentTime > endTime) {
    contest.status = 'finished'
  } else {
    contest.status = 'ongoing'
  }

  const year = new Date().getFullYear()
  const start = format(contest.startTime, year)
  const end = format(contest.endTime, year)

  return (
    <article>
      <header className="flex justify-between p-5 py-4">
        <h2 className="break-words text-2xl font-extrabold">{contest.title}</h2>
        {contest.status === 'finished' && (
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <p>Finished</p>
            <FaRegCalendarAlt className="shrink-0" />
            <p>
              {start} - {end}
            </p>
          </div>
        )}
        {contest.status === 'ongoing' && (
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <p>Ongoing</p>
            <FaRegClock className="shrink-0" />
            <p className="text-red-500">
              <TimeDiff timeRef={contest.endTime}></TimeDiff>
            </p>
          </div>
        )}
        {contest.status === 'upcoming' && (
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <p>Upcoming</p>
            <FaRegClock className="shrink-0" />
            <TimeDiff timeRef={contest.startTime}></TimeDiff>
          </div>
        )}
      </header>
      {tabs}
    </article>
  )
}
