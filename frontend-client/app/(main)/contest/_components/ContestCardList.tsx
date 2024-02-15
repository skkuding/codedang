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

export default async function Contest({
  title,
  type
}: {
  type: string
  title: string
}) {
  const data = (await getContests()).filter(
    (contest) => contest.status.toLowerCase() === type.toLowerCase()
  )
  const contestChunks = []
  for (let i = 0; i < data.length; i += 3)
    contestChunks.push(data.slice(i, i + 3))

  return data.length === 0 ? (
    <></>
  ) : (
    <Carousel>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-700">{title}</h1>
        <div className="flex items-center justify-end gap-2">
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </div>
      <CarouselContent className="p-2">
        {contestChunks.map((contestChunk) => (
          <CarouselItem key={contestChunk[0].id} className="flex w-full gap-3">
            {contestChunk.map((contest) => (
              <Link
                key={contest.id}
                href={`/contest/${contest.id}` as Route}
                className="block w-1/3"
              >
                <ContestCard contest={contest} />
              </Link>
            ))}
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}
