'use client'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/shadcn/carousel'
import { cn, fetcherWithAuth, safeFetcherWithAuth } from '@/libs/utils'
import type { JoinedCourse } from '@/types/type'
import { useQuery } from '@tanstack/react-query'
import type { Route } from 'next'
import Link from 'next/link'
import { useMemo } from 'react'
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

interface CourseCardListProps {
  title: string
}

export function CourseCardList({ title }: CourseCardListProps) {
  // Get username and generate colors
  const { data: username = 'unknown' } = useQuery({
    queryKey: ['username'],
    queryFn: async () => {
      const data: Profile = await safeFetcherWithAuth.get('user').json()
      return data.username
    }
  })

  const colors = useMemo(() => getRandomColorArray(username), [username])

  const { data: courses = [] } = useQuery({
    queryKey: ['joinedCourses'],
    queryFn: async () => {
      return await fetcherWithAuth.get('course/joined').json<JoinedCourse[]>()
    }
  })

  if (courses.length === 0) {
    return (
      <div className="flex w-full flex-col gap-6">
        <div className="flex w-full items-center justify-between">
          <div className="text-2xl font-semibold text-black">
            {title} <RegisterCourseButton />
          </div>
        </div>
        <p className="text-lg font-light text-gray-500">
          Please Register Course First!
        </p>
      </div>
    )
  }

  return (
    <Carousel className="flex w-full flex-col gap-6">
      <div className="flex w-full items-center justify-between">
        <div className="text-2xl font-semibold text-black">
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
