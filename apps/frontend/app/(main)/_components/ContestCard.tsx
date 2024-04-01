import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn, dateFormatter } from '@/lib/utils'
import type { Contest } from '@/types/type'
import { FaRegClock } from 'react-icons/fa'
import { FaRegCalendarAlt } from 'react-icons/fa'
import Badge from './Badge'
import TimeDiff from './TimeDiff'

const variants = {
  ongoing: 'bg-gradient-to-br from-blue-500 to-blue-950',
  upcoming: 'bg-gradient-to-br from-emerald-600 to-emerald-900',
  finished: 'bg-gray-500',
  registeredOngoing: 'bg-gradient-to-br from-blue-500 to-blue-950',
  registeredUpcoming: 'bg-gradient-to-br from-emerald-600 to-emerald-900'
}

interface Props {
  contest: Contest
}

const format = (target: Date, year: number): string =>
  new Date(target).getFullYear() === year
    ? dateFormatter(target, 'MMM DD')
    : dateFormatter(target, 'MMM DD, YYYY')

export default function ContestCard({ contest }: Props) {
  const year = new Date().getFullYear()
  const startTime = format(contest.startTime, year)
  const endTime = format(contest.endTime, year)

  return (
    <Card
      className={cn(
        'flex w-full flex-col justify-between gap-1 border-none text-white shadow-none transition hover:scale-105 hover:opacity-80',
        variants[contest.status]
      )}
    >
      <CardHeader className="pb-0">
        <Badge type={contest.status}>
          <p>
            {contest.status.startsWith('registered')
              ? 'registered'
              : contest.status}
          </p>
        </Badge>
        <CardTitle className="overflow-hidden text-ellipsis whitespace-nowrap text-lg font-semibold">
          {contest.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="inline-flex items-center gap-1 whitespace-nowrap text-xs text-white opacity-80">
        {contest.status === 'finished' ? (
          <>
            <FaRegCalendarAlt className="shrink-0" />
            <p className="overflow-hidden text-ellipsis whitespace-nowrap">
              {startTime} - {endTime}
            </p>
          </>
        ) : (
          <>
            <FaRegClock className="shrink-0" />
            {contest.status === 'ongoing' ? 'Ends in' : 'Starts in'}
            <p className="overflow-hidden text-ellipsis whitespace-nowrap">
              <TimeDiff timeRef={contest.endTime}></TimeDiff>
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
