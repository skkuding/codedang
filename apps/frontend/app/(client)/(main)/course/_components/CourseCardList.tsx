'use client'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from '@/components/shadcn/carousel'
import { cn, safeFetcherWithAuth } from '@/libs/utils'
import type { JoinedCourse } from '@/types/type'
import { useQuery } from '@tanstack/react-query'
import type { Route } from 'next'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { CourseCard } from '../_components/CourseCard'
import { MobileCourseCard } from './MobileCourseCard'
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
  courses: JoinedCourse[]
}

export function CourseCardList({ title, courses }: CourseCardListProps) {
  // Get username and generate colors
  const { data: username = 'unknown' } = useQuery({
    queryKey: ['username'],
    queryFn: async () => {
      const data: Profile = await safeFetcherWithAuth.get('user').json()
      return data.username
    }
  })

  const colors = useMemo(() => getRandomColorArray(username), [username])

  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!carouselApi) {
      return
    }

    const onInit = () => {
      setCount(carouselApi.scrollSnapList().length)
      setCurrent(carouselApi.selectedScrollSnap() + 1)
    }

    const onSelect = () => {
      setCurrent(carouselApi.selectedScrollSnap() + 1)
    }

    onInit()
    carouselApi.on('reInit', onInit)
    carouselApi.on('select', onSelect)

    return () => {
      carouselApi.off('reInit', onInit)
      carouselApi.off('select', onSelect)
    }
  }, [carouselApi])

  if (courses.length === 0) {
    return (
      <div className="flex w-full flex-col gap-10 md:items-center md:justify-between">
        <div className="flex gap-4 text-[20px] font-semibold leading-9 tracking-[-0.9px] text-black md:text-[30px]">
          {title}
          <RegisterCourseButton />
        </div>
        <div className="flex h-72 w-full flex-col items-center justify-center rounded-[20px] border border-[#DFDFDF] text-xl font-normal text-[#737373]">
          <p>There are no courses registered!</p>
          <p>
            Please click the register button at the top to enroll in a course.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* 데스크톱 */}
      <div className="hidden sm:block">
        <Carousel
          setApi={setCarouselApi}
          opts={{ align: 'start' }}
          className="flex w-full flex-col gap-6"
        >
          <div className="flex w-full md:items-center md:justify-between">
            <div className="flex gap-4 text-[20px] font-semibold leading-9 tracking-[-0.9px] text-black md:text-[30px]">
              {title}
              <div className="hidden sm:flex">
                <RegisterCourseButton />
              </div>
            </div>
            <div className="hidden items-center justify-end gap-2 sm:flex">
              <CarouselPrevious />
              <CarouselNext />
            </div>
          </div>
          <div className="-mx-4 sm:-mx-[116px]">
            <CarouselContent className="mx-[calc((100%-310px)/2)] my-[14px] sm:ml-28 sm:mr-3">
              {courses.map((course, index) => (
                <CarouselItem
                  key={course.groupName}
                  className={cn(
                    'flex pl-0 pr-4 transition hover:scale-105 hover:opacity-80',
                    index === courses.length - 1 && 'sm:pr-0'
                  )}
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
              <CarouselItem className="flex pl-0 transition hover:scale-105 hover:opacity-80">
                <div className="flex h-[300px] w-[310px] items-center justify-center rounded-lg border sm:-ml-4 sm:hidden">
                  <RegisterCourseButton />
                </div>
              </CarouselItem>
            </CarouselContent>
          </div>
        </Carousel>
        <div className="py-4 text-center text-sm sm:hidden">
          <div className="mb-2 flex items-center justify-center gap-2">
            {Array.from({ length: count }).map((_, index) => (
              <button
                key={index}
                onClick={() => carouselApi?.scrollTo(index)}
                className={`h-2 w-2 rounded-full ${
                  index + 1 === current ? 'bg-slate-900' : 'bg-slate-300'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <div className="mb-4 flex items-center justify-start gap-3 px-1">
          <div className="text-[20px] font-semibold tracking-[-0.6px]">
            {title}
          </div>
          <RegisterCourseButton />
        </div>

        <Carousel
          setApi={setCarouselApi}
          opts={{ align: 'start' }}
          className="w-full"
        >
          <CarouselContent className="overflow-visible py-2">
            {Array.from({ length: Math.ceil(courses.length / 4) }).map(
              (_, pageIndex) => (
                <CarouselItem key={pageIndex} className="basis-full">
                  <div className="grid grid-cols-2 gap-3 px-1">
                    {courses
                      .slice(pageIndex * 4, pageIndex * 4 + 4)
                      .map((course, index) => (
                        <Link
                          key={course.id}
                          href={`/course/${course.id}` as Route}
                        >
                          <MobileCourseCard
                            course={course}
                            color={
                              colors[(pageIndex * 4 + index) % colors.length]
                            }
                          />
                        </Link>
                      ))}
                  </div>
                </CarouselItem>
              )
            )}
          </CarouselContent>
        </Carousel>

        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: Math.ceil(courses.length / 4) }).map(
            (_, index) => (
              <button
                key={index}
                onClick={() => carouselApi?.scrollTo(index)}
                className={`h-2 w-2 rounded-full ${
                  index + 1 === current ? 'bg-primary' : 'bg-color-neutral-90'
                }`}
              />
            )
          )}
        </div>
      </div>
    </>
  )
}
