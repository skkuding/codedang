import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Contest } from '@/types/type'
import dayjs from 'dayjs'
import Badge from './Badge'
import TimeDiff from './TimeDiff'

const variants = {
  ongoing: 'bg-gradient-to-br from-[#9BE299] to-[#82D4E7]',
  upcoming: 'bg-gradient-to-br from-[#A6B8FF] to-[#86C8DE]',
  finished: 'bg-gradient-to-br from-[#D1C9D9] to-[#B9C8E6]'
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
        'my-2 flex h-40 w-60 flex-col justify-between border-0 shadow-md transition hover:scale-105 hover:opacity-80 md:h-44 md:w-72',
        variants[contest.status]
      )}
    >
      <CardHeader className="m-4 space-y-0 p-0 text-sm">
        {contest.status == 'ongoing' ? (
          <Badge type={contest.status}>
            <div className="text-red-500">
              <TimeDiff timeRef={contest.endTime}></TimeDiff>
            </div>
          </Badge>
        ) : (
          <p className="text-right text-blue-50">{`${startTime} - ${endTime}`}</p>
        )}
      </CardHeader>
      <CardContent className="p-5 pt-0">
        <CardTitle className="line-clamp-2 overflow-hidden break-keep text-xl tracking-normal text-white md:text-2xl">
          {contest.title}
        </CardTitle>
      </CardContent>
    </Card>
  )
}
