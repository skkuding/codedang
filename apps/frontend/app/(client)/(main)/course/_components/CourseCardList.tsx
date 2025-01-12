import CourseCard from '@/app/(client)/(main)/course/_components/CourseCard'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/shadcn/carousel'
import { cn, fetcher, fetcherWithAuth } from '@/libs/utils'
import type { course } from '@/types/type'
import type { Route } from 'next'
import type { Session } from 'next-auth'
import Link from 'next/link'

const getCourses = async () => {
  const data: {
    ongoing: course[] //Course type 정의 후 수정
    upcoming: course[]
  } = await fetcher.get('assignment/ongoing-upcoming').json() //group으로 해야하나 assignment로 해야하나!!
  data.ongoing.forEach((Course) => {
    Course.status = 'ongoing'
  })
  data.upcoming.forEach((Course) => {
    Course.status = 'upcoming'
  })
  return data.ongoing.concat(data.upcoming)
}

const getRegisteredCourses = async () => {
  //현재 등록된 course를 불러온다.
  const data: {
    registeredOngoing: course[] //Course Interface를 정의한 뒤 수정해야한다.
    registeredUpcoming: course[]
    ongoing: course[]
    upcoming: course[]
  } = await fetcherWithAuth
    .get('assignment/ongoing-upcoming-with-registered')
    .json()
  data.registeredOngoing.forEach((Course) => {
    Course.status = 'registeredOngoing'
  })
  data.registeredUpcoming.forEach((Course) => {
    Course.status = 'registeredUpcoming'
  })
  data.ongoing.forEach((Course) => {
    Course.status = 'ongoing'
  })
  data.upcoming.forEach((Course) => {
    Course.status = 'upcoming'
  })
  return data.ongoing.concat(
    data.upcoming.concat(data.registeredOngoing.concat(data.registeredUpcoming))
  )
}

type ItemsPerSlide = 2 | 3

function CourseCardCarousel({
  itemsPerSlide,
  title,
  data
}: {
  itemsPerSlide: ItemsPerSlide
  title: string
  data: course[] //type 수정.
}) {
  const chunks = []

  if (itemsPerSlide === 3) {
    for (let i = 0; i < data.length; i += 3) chunks.push(data.slice(i, i + 3))
  } else if (itemsPerSlide === 2) {
    for (let i = 0; i < data.length; i += 2) chunks.push(data.slice(i, i + 2))
  }
  //course를 모두 Course로 바꿈.
  //courseCard to AssignsmentCard.
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
            {chunk.map((Course) => (
              <Link
                key={Course.id}
                href={`/course/${Course.id}` as Route}
                className={cn(
                  'block overflow-hidden p-2',
                  itemsPerSlide === 3 ? 'w-1/3' : 'w-1/2'
                )}
              >
                <CourseCard Course={Course} />
              </Link>
            ))}
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}
//Contest를 Course로 모두 이름 변경!
export default async function Course({
  title,
  type,
  session
}: {
  type: string
  title: string
  session?: Session | null
}) {
  const data = (
    session ? await getRegisteredCourses() : await getCourses()
  ).filter(
    (course) =>
      course.status.toLowerCase() === 'registered' + type.toLowerCase() ||
      course.status.toLowerCase() === type.toLowerCase()
  )

  data.sort((a, b) => +new Date(a.startTime) - +new Date(b.startTime))

  return data.length === 0 ? (
    <></>
  ) : (
    <>
      <CourseCardCarousel itemsPerSlide={3} title={title} data={data} />
      <CourseCardCarousel itemsPerSlide={2} title={title} data={data} />
    </>
  )
}
