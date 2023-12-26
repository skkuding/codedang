import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import Badge from './Badge'

export enum ContestStatus {
  Ongoing = 'ongoing',
  Upcoming = 'upcoming',
  Finished = 'finished'
}
const cardVariants = {
  ongoing: 'bg-gradient-to-r from-[#85c63f] to-[#C6b83f]',
  upcoming: 'bg-gradient-to-r from-[#FEB144] to-[#FAFE44]',
  finished: 'bg-gray-500'
}

export default function CardWrapper() {
  const status = ContestStatus.Upcoming

  return (
    <Card className={`${cardVariants[status]}`}>
      <CardContent className="p-6">
        <Badge status={ContestStatus.Ongoing}></Badge>
      </CardContent>
      <CardHeader>
        <p className="font-bold text-white">participate 어쩌고</p>
        <CardTitle className="text-3xl text-white">코드당 대회</CardTitle>
      </CardHeader>
      <CardFooter className="rounded-b-3xl bg-white">
        <p>날짜</p>
      </CardFooter>
    </Card>
  )
}
