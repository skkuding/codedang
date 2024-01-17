import ContestCard from '@/app/(main)/_components/ContestCard'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
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

export default async function Contest() {
  const contests = await getContests()

  return (
    <Carousel>
      <CarouselPrevious />
      <CarouselNext />
      <CarouselContent>
        {contests.map((contest) => {
          return (
            <CarouselItem
              key={contest.id}
              className="bottom-30 flex w-full justify-between gap-5 overflow-hidden"
            >
              <Link
                key={contest.id}
                href={`/contest/${contest.id}` as Route}
                className="inline-block h-[120] w-[325]"
              >
                <ContestCard contest={contest} />
              </Link>
            </CarouselItem>
          )
        })}
      </CarouselContent>
    </Carousel>
  )
}
