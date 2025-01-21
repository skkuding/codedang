import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/shadcn/carousel'
import { cn, safeFetcherWithAuth } from '@/libs/utils'
import type { Course, RawCourse } from '@/types/type'
import type { Route } from 'next'
import type { Session } from 'next-auth'
import Link from 'next/link'
import { CourseCard } from '../_components/CourseCard'

const bgVariants = [
  'bg-[#fed7de]',
  'bg-[#c4f2de]',
  'bg-[#e6ffe2]',
  'bg-[#e7d9fe]',
  'bg-[#c4d8f7]',
  'bg-[#ffef98]'
]

interface Profile {
  username: string // ID
  userProfile: {
    realName: string
  }
  studentId: string
  major: string
}

function getRandomColorArray(username: string) {
  let hash = 0
  for (let i = 0; i < username.length; i++) {
    hash = (hash << 5) - hash + username.charCodeAt(i)
    hash |= 0
  }

  function pseudoRandom(seed: number) {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }

  const array = [...bgVariants]

  let seed = Math.abs(hash)
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(pseudoRandom(seed) * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
    seed = seed * 9301 + 49297
  }

  return array
}

const getUsername = async () => {
  try {
    const data: Profile = await safeFetcherWithAuth.get('user').json()
    return data.username
  } catch {
    return 'unknown'
  }
}

const getCourses = async () => {
  try {
    const rawData: RawCourse[] = await safeFetcherWithAuth
      .get('group/joined')
      .json()
    const data: Course[] = rawData.map((item: RawCourse) => ({
      id: item.id,
      groupName: item.groupName,
      description: item.description,
      memberNum: item.memberNum,
      status: 'ongoing',
      semester: '2025 Spring',
      professor: 'Ha Jimin'
    }))
    return data
  } catch {
    return []
  }
}

type ItemsPerSlide = 2 | 3

async function CourseCardCarousel({
  itemsPerSlide,
  title,
  data
}: {
  itemsPerSlide: ItemsPerSlide
  title: string
  data: Course[]
}) {
  const colors = getRandomColorArray(await getUsername())

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
            {chunk.map((course, index) => (
              <Link
                key={course.id}
                href={`/course/${course.id}` as Route}
                className={cn(
                  'block overflow-hidden p-2',
                  itemsPerSlide === 3 ? 'w-1/3' : 'w-1/2'
                )}
              >
                <CourseCard course={course} color={colors[index]} />
              </Link>
            ))}
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}

//Contest를 Course로 모두 이름 변경!
export async function CourseCardList({
  title
}: {
  type: string
  title: string
  session?: Session | null
}) {
  const data = await getCourses()

  return data.length === 0 ? (
    <div>No courses have been registered.</div>
  ) : (
    <>
      <CourseCardCarousel itemsPerSlide={3} title={title} data={data} />
      <CourseCardCarousel itemsPerSlide={2} title={title} data={data} />
    </>
  )
}
