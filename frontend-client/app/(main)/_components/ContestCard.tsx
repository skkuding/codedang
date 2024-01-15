import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Contest } from '@/types/type'
import dayjs from 'dayjs'
import { FaRegClock } from 'react-icons/fa'
import { FaRegCalendarAlt } from 'react-icons/fa'
import Badge from './Badge'
import TimeDiff from './TimeDiff'

const variants = {
  ongoing: 'bg-gradient-to-br from-blue-500 to-blue-950',
  upcoming: 'bg-gradient-to-br from-emerald-600 to-emerald-900',
  finished: 'bg-gray-500'
}

interface Props {
  contest: Contest
}

const format = (target: Date, year: number): string =>
  new Date(target).getFullYear() === year
    ? dayjs(target).format('MMM DD')
    : dayjs(target).format('MMM DD, YYYY')

export default function ContestCard({ contest }: Props) {
  const year = new Date().getFullYear()
  const startTime = format(contest.startTime, year)
  const endTime = format(contest.endTime, year)

  return (
    <Card
      className={cn(
        'my-2 flex h-40 w-64 flex-col justify-between rounded-md border-0 text-white shadow-md transition hover:scale-105 hover:opacity-80 md:h-32 md:w-96',
        variants[contest.status]
      )}
    >
      <CardHeader className="pb-0">
        <Badge type={contest.status}>
          <p>{contest.status}</p>
        </Badge>

        <CardTitle className="text-lg font-semibold">{contest.title}</CardTitle>
      </CardHeader>

      <CardContent className="flex items-center gap-1 text-xs text-white opacity-80">
        {contest.status === 'finished' ? (
          <>
            <FaRegCalendarAlt />
            {startTime} - {endTime}
          </>
        ) : (
          <>
            <FaRegClock />
            {contest.status === 'ongoing' ? 'Ends in' : 'Starts in'}
            <TimeDiff timeRef={contest.endTime}></TimeDiff>
          </>
        )}
      </CardContent>
    </Card>
  )
}
