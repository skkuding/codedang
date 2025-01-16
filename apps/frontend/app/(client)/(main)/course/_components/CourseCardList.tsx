import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/shadcn/carousel'
import { cn, fetcherWithAuth } from '@/libs/utils'
import type { Course, RawCourse } from '@/types/type'
import type { Route } from 'next'
import type { Session } from 'next-auth'
import Link from 'next/link'
import CourseCard from '../_components/CourseCard'

const getCourses = async () => {
  const rawData = await fetcherWithAuth.get('group/joined').json()
  console.log('Raw data:', rawData) // 원본 데이터 로그 출력

  // 데이터를 매핑하여 Course 타입으로 변환
  const data: Course[] = rawData.map((item: RawCourse) => ({
    id: item.id,
    groupName: item.groupName,
    description: item.description,
    memberNum: item.memberNum,
    status: 'ongoing',
    semester: '2025 Spring',
    professor: 'Ha Jimin'
  }))

  console.log('Transformed data:', data) // 변환된 데이터 로그 출력
  return data
}

type ItemsPerSlide = 2 | 3

function CourseCardCarousel({
  itemsPerSlide,
  title,
  data
}: {
  itemsPerSlide: ItemsPerSlide
  title: string
  data: Course[] //type 수정.
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
            {chunk.map((course) => (
              <Link
                key={course.id}
                href={`/course/${course.id}` as Route}
                className={cn(
                  'block overflow-hidden p-2',
                  itemsPerSlide === 3 ? 'w-1/3' : 'w-1/2'
                )}
              >
                <CourseCard course={course} />
              </Link>
            ))}
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}

//Contest를 Course로 모두 이름 변경!
export default async function CourseCardList({
  title
}: {
  type: string
  title: string
  session?: Session | null
}) {
  const data = await getCourses()
  console.log('Courses data:', data)

  return data.length === 0 ? (
    <>No courses have been registered.</>
  ) : (
    <>
      <CourseCardCarousel itemsPerSlide={3} title={title} data={data} />
      <CourseCardCarousel itemsPerSlide={2} title={title} data={data} />
    </>
  )
}
