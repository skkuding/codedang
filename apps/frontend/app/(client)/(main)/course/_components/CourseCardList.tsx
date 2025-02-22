import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/shadcn/carousel'
import { cn, safeFetcherWithAuth } from '@/libs/utils'
import type { JoinedCourse } from '@/types/type'
import type { Route } from 'next'
import type { Session } from 'next-auth'
import Link from 'next/link'
import { CourseCard } from '../_components/CourseCard'
import { RegisterCourseButton } from './RegisterCourseButton'

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

interface CourseCardCarouselProps {
  title: string
  courses: JoinedCourse[]
}

async function CourseCardCarousel({ title, courses }: CourseCardCarouselProps) {
  const colors = getRandomColorArray(await getUsername())

  return (
    <Carousel className="flex w-full flex-col gap-6">
      <div className="flex w-full items-center justify-between">
        <div className="text-2xl font-semibold text-gray-700">
          {title} <RegisterCourseButton />
        </div>
        <div className="flex items-center justify-end gap-2">
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </div>
      <div className="-mx-24">
        <CarouselContent className="my-[14px] ml-24 mr-3 gap-4">
          {courses.map((course, index) => (
            <CarouselItem
              key={course.groupName}
              className="flex pl-0 transition hover:scale-105 hover:opacity-80"
            >
              <Link
                key={course.id}
                href={`/course/${course.id}` as Route}
                className={cn('block overflow-hidden')}
              >
                <CourseCard
                  index={index}
                  course={course}
                  color={colors[index]}
                />
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </div>
    </Carousel>
  )
}

interface CourseCardListProps {
  title: string
  session?: Session | null
  courses: JoinedCourse[]
}

export function CourseCardList({ title, courses }: CourseCardListProps) {
  return courses.length === 0 ? (
    <div>No courses have been registered.</div>
  ) : (
    <CourseCardCarousel title={title} courses={courses} />
  )
}
