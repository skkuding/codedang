import ContestCard from '@/app/(main)/_components/ContestCard'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselNextGradient,
  CarouselPrevGradient
} from '@/components/ui/carousel'
import { fetcher } from '@/lib/utils'
import type { Contest } from '@/types/type'
import type { Route } from 'next'
import Link from 'next/link'

const getContests = async () => {
  const data: {
    ongoing: Contest[]
    upcoming: Contest[]
  } = await fetcher.get('contest').json()
  data.ongoing.forEach((contest) => {
    contest.status = 'ongoing'
  })
  data.upcoming.forEach((contest) => {
    contest.status = 'upcoming'
  })
  return data.ongoing.concat(data.upcoming)
}

export default async function Contest({ type }: { type: string }) {
  const contests = await getContests()

  return (
    <Carousel>
      <div className="flex items-center justify-between">
        <div className="pb-5 text-2xl font-bold text-gray-700">{type}</div>
        <div className="flex items-center justify-end gap-2">
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </div>
      <CarouselContent className="bottom-30 flex w-full gap-1.5 px-3 py-2">
        {contests
          .filter(
            (contest) => contest.status.toLowerCase() === type.toLowerCase()
          )
          .map((contest) => (
            <CarouselItem key={contest.id}>
              <Link
                key={contest.id}
                href={`/contest/${contest.id}` as Route}
                className="inline-block h-[120px] w-[375px]"
              >
                <ContestCard contest={contest} />
              </Link>
            </CarouselItem>
          ))}
      </CarouselContent>
      <CarouselPrevGradient />
      <CarouselNextGradient />
    </Carousel>
  )
}
