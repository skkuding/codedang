import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import type { Contest } from '@/types/type'
import dayjs from 'dayjs'
import Badge from './Badge'

const variants = {
  style: {
    ongoing: 'bg-gradient-to-r from-primary to-secondary',
    upcoming: 'bg-gradient-to-r from-[#23d7ce] to-[#fff42c]',
    finished: 'bg-gray-300',
    level: 'bg-gray-500'
  },
  description: {
    ongoing: 'Participate Now!',
    upcoming: 'Register Now!',
    finished: 'Practice Now!'
  }
}

interface Props {
  contest: Contest
}

export default function ContestCard({ contest }: Props) {
  const startTime = dayjs(contest.startTime).format('YYYY-MM-DD')
  const endTime = dayjs(contest.endTime).format('YYYY-MM-DD')

  return (
    <Card className={variants.style[contest.badge]}>
      <Badge badge={contest.badge}></Badge>
      <CardHeader>
        <CardDescription className="font-bold text-white">
          {variants.description[contest.badge]}
        </CardDescription>
        <CardTitle className="text-3xl text-white">{contest.title}</CardTitle>
      </CardHeader>
      <CardFooter className="justify-between rounded-b-3xl bg-white">
        <p>{`${startTime} ~ ${endTime}`}</p>
        {contest.badge == 'ongoing' && (
          <p className="text-red-500">Remaining Time: {'...'}</p>
        )}
      </CardFooter>
    </Card>
  )
}
