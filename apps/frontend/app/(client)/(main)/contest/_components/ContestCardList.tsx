import ContestCard from '@/app/(client)/(main)/_components/ContestCard'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/shadcn/carousel'
import { cn, fetcher, fetcherWithAuth } from '@/libs/utils'
import type { Contest } from '@/types/type'
import type { Session } from 'next-auth'
import Link from 'next/link'

const getContests = async () => {
  const data: {
    ongoing: Contest[]
    upcoming: Contest[]
  } = await fetcher.get('contest/ongoing-upcoming').json()

  return [
    ...data.ongoing.map((item) => ({ ...item, status: 'ongoing' as const })),
    ...data.upcoming.map((item) => ({ ...item, status: 'upcoming' as const }))
  ]
}

const getRegisteredContests = async () => {
  const data: {
    registeredOngoing: Contest[]
    registeredUpcoming: Contest[]
    ongoing: Contest[]
    upcoming: Contest[]
  } = await fetcherWithAuth
    .get('contest/ongoing-upcoming-with-registered')
    .json()

  return [
    ...data.ongoing.map((item) => ({ ...item, status: 'ongoing' as const })),
    ...data.upcoming.map((item) => ({ ...item, status: 'upcoming' as const })),
    ...data.registeredOngoing.map((item) => ({
      ...item,
      status: 'registeredOngoing' as const
    })),
    ...data.registeredUpcoming.map((item) => ({
      ...item,
      status: 'registeredUpcoming' as const
    }))
  ]
}

type ItemsPerSlide = 2 | 3

function ContestCardCarousel({
  itemsPerSlide,
  title,
  data
}: {
  itemsPerSlide: ItemsPerSlide
  title: string
  data: Required<Contest>[]
}) {
  const chunks = []

  if (itemsPerSlide === 3) {
    for (let i = 0; i < data.length; i += 3) chunks.push(data.slice(i, i + 3))
  } else if (itemsPerSlide === 2) {
    for (let i = 0; i < data.length; i += 2) chunks.push(data.slice(i, i + 2))
  }

  return (
    <Carousel
      className={cn(itemsPerSlide === 3 ? 'max-xl:hidden' : 'xl:hidden')}
    >
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-700">{title}</h1>
        <div className="flex items-center justify-end gap-2">
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </div>
      <CarouselContent className="p-1">
        {chunks.map((chunk) => (
          <CarouselItem key={chunk[0].id} className="flex w-full gap-3">
            {chunk.map((contest) => (
              <Link
                key={contest.id}
                href={`/contest/${contest.id}`}
                className={cn(
                  'block overflow-hidden p-2',
                  itemsPerSlide === 3 ? 'w-1/3' : 'w-1/2'
                )}
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

export default async function Contest({
  title,
  type,
  session
}: {
  type: string
  title: string
  session?: Session | null
}) {
  const data = (
    session ? await getRegisteredContests() : await getContests()
  ).filter(
    (contest) =>
      contest.status.toLowerCase() === 'registered' + type.toLowerCase() ||
      contest.status.toLowerCase() === type.toLowerCase()
  )

  data.sort((a, b) => +new Date(a.startTime) - +new Date(b.startTime))

  return data.length === 0 ? (
    <></>
  ) : (
    <>
      <ContestCardCarousel itemsPerSlide={3} title={title} data={data} />
      <ContestCardCarousel itemsPerSlide={2} title={title} data={data} />
    </>
  )
}
