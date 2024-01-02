import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Contest } from '@/types/type'
import dayjs from 'dayjs'
import Badge from './Badge'
import TimeDiff from './TimeDiff'

const variants = {
  ongoing: 'bg-gradient-to-r from-primary to-secondary',
  upcoming: 'bg-gradient-to-r from-secondary to-[#fff42c]',
  finished: 'bg-gray-400'
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
        'flex h-56 flex-col justify-between border-none bg-gray-500',
        variants[contest.status]
      )}
    >
      <Badge badge={contest.status}></Badge>
      <div>
        <CardHeader className="space-y-0 p-5">
          {contest.status == 'ongoing' && (
            <CardDescription className="font-bold text-white">
              Participate Now!
            </CardDescription>
          )}
          <CardTitle className="overflow-hidden text-ellipsis whitespace-nowrap text-3xl tracking-normal text-white">
            {contest.title}
          </CardTitle>
        </CardHeader>
        <CardFooter className="justify-between rounded-b-3xl border border-gray-300 bg-white px-5 text-sm">
          <p className="text-gray-500">{`${startTime} - ${endTime}`}</p>
          {contest.status == 'ongoing' && (
            <div className="text-red-500">
              <TimeDiff timeRef={contest.endTime}></TimeDiff>
            </div>
          )}
        </CardFooter>
      </div>
    </Card>
  )
}
