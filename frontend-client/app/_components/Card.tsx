import {
  Card,
  CardContent,
  CardDescription,
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
    <Card className={cardVariants[status]}>
      <CardContent>
        <Badge status={ContestStatus.Ongoing}></Badge>
        <p>SKKU 어쩌고</p>
      </CardContent>
      <CardHeader>
        <CardTitle>코드당 대회</CardTitle>
        <CardDescription>For 어쩌고</CardDescription>
      </CardHeader>
      <CardFooter>
        <p>날짜</p>
      </CardFooter>
    </Card>
  )
}
