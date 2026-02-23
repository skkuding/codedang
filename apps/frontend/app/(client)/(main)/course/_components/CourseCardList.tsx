'use client'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from '@/components/shadcn/carousel'
import { cn, fetcherWithAuth, safeFetcherWithAuth } from '@/libs/utils'
import type { JoinedCourse } from '@/types/type'
import { useQuery } from '@tanstack/react-query'
import { useTranslate } from '@tolgee/react'
import type { Route } from 'next'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
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
  const { t } = useTranslate()

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
      <div className="flex w-full flex-col gap-10">
        <div className="flex gap-4 text-2xl font-semibold text-black">
          {title}
          <RegisterCourseButton />
        </div>
        <div className="flex h-72 w-full flex-col items-center justify-center rounded-[20px] border border-[#DFDFDF] text-xl font-normal text-[#737373]">
          <p>{t('no_courses_registered_message')}</p>
          <p>{t('register_button_prompt')}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Carousel
        setApi={setCarouselApi}
        opts={{ align: 'start' }}
        className="flex w-full flex-col gap-6"
      >
        <div className="flex w-full items-center justify-center sm:justify-between">
          <div className="flex gap-4 text-2xl font-semibold text-black">
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
    </>
  )
}
