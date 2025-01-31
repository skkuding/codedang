import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/shadcn/carousel'
import { cn, fetcher, fetcherWithAuth } from '@/libs/utils'
import type { Assignment } from '@/types/type'
import type { Route } from 'next'
import type { Session } from 'next-auth'
import Link from 'next/link'
import { AssignmentCard } from '../_components/AssignmentCard'

const getAssignments = async () => {
  const data: {
    ongoing: Assignment[]
    upcoming: Assignment[]
  } = await fetcher.get('assignment/ongoing-upcoming').json()
  data.ongoing.forEach((assignment) => {
    assignment.status = 'ongoing'
  })
  data.upcoming.forEach((assignment) => {
    assignment.status = 'upcoming'
  })
  return data.ongoing.concat(data.upcoming)
}

const getRegisteredAssignments = async () => {
  //현재 등록된 assignments를 불러온다.
  const data: {
    registeredOngoing: Assignment[]
    registeredUpcoming: Assignment[]
  } = await fetcherWithAuth
    .get('assignment/ongoing-upcoming-with-registered')
    .json()
  data.registeredOngoing.forEach((assignment) => {
    assignment.status = 'registeredOngoing'
  })
  data.registeredUpcoming.forEach((assignment) => {
    assignment.status = 'registeredUpcoming'
  })
  return data.registeredOngoing.concat(data.registeredUpcoming)
}

type ItemsPerSlide = 2 | 3

interface AssignmentCardCarouselProps {
  itemsPerSlide: ItemsPerSlide
  title: string
  data: Assignment[]
}

function AssignmentCardCarousel({
  itemsPerSlide,
  title,
  data
}: AssignmentCardCarouselProps) {
  const chunks = []

  if (itemsPerSlide === 3) {
    for (let i = 0; i < data.length; i += 3) {
      chunks.push(data.slice(i, i + 3))
    }
  } else if (itemsPerSlide === 2) {
    for (let i = 0; i < data.length; i += 2) {
      chunks.push(data.slice(i, i + 2))
    }
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
            {chunk.map((assignment) => (
              <Link
                key={assignment.id}
                href={
                  `/course/${assignment.group.id}/assignment/${assignment.id}` as Route
                }
                className={cn(
                  'block overflow-hidden p-2',
                  itemsPerSlide === 3 ? 'w-1/3' : 'w-1/2'
                )}
              >
                <AssignmentCard assignment={assignment} />
              </Link>
            ))}
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}

interface AssignmentCardListProps {
  type: string
  title: string
  session?: Session | null
}

export async function AssignmentCardList({
  title,
  type,
  session
}: AssignmentCardListProps) {
  const data = (
    session ? await getRegisteredAssignments() : await getAssignments()
  ).filter(
    (assignment) =>
      assignment.status.toLowerCase() === `registered${type.toLowerCase()}` ||
      assignment.status.toLowerCase() === type.toLowerCase()
  )

  data.sort(
    (a, b) => Number(new Date(a.startTime)) - Number(new Date(b.startTime))
  )

  return data.length === 0 ? null : (
    <>
      <AssignmentCardCarousel itemsPerSlide={3} title={title} data={data} />
      <AssignmentCardCarousel itemsPerSlide={2} title={title} data={data} />
    </>
  )
}
