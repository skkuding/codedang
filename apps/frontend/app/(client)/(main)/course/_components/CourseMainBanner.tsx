'use client'

import { Button } from '@/components/shadcn/button'
import { courseOvalIconColors, courseTextcolors } from '@/libs/constants'
import { cn } from '@/libs/utils'
import type { JoinedCourse } from '@/types/type'
import { useTranslate } from '@tolgee/react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { FaArrowRight, FaCirclePlay } from 'react-icons/fa6'

interface OvalIconProps {
  position: string
  transform: string
  backgroundColor: string
  additionalClasses?: string
}

interface BannerPageDotsProps {
  slideType: string
}

export function CourseMainBanner({ course }: { course: JoinedCourse | null }) {
  const { t } = useTranslate()
  const [facade, setFacade] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      setFacade((facade + 1) % slides.length)
    }, 5000)
    return () => clearTimeout(timer)
  }, [facade])

  const handleClick = (next: number) => {
    setFacade(next % slides.length)
  }

  const slides = [
    {
      type: 'course',
      subDescription: t('structured_learning_course'),
      mainDescription: `${t('codedang')}\n${t('course_hub')}`,
      buttonDescription: t('check_your_course'),
      bgcolor: 'bg-[linear-gradient(95deg,#E0D0FF_50.46%,#9B99FF_82.55%)]',
      mainDescriptionColor:
        'linear-gradient(100deg, #12134A -7.99%, #262799 23.9%, #4D3CCF 65.71%)',
      img: '/banners/notebook.png',
      imgAlt: t('recent_course')
    }
  ]

  return (
    <div className="w-full xl:w-screen">
      <div className="relative h-[500px] w-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={cn(
              'absolute inset-0 z-10 flex items-center justify-center overflow-hidden pt-[60px] text-white transition-opacity duration-1000 ease-in-out',
              facade !== index && 'z-0 opacity-0',
              slide.bgcolor
            )}
          >
            <div className="flex w-[78%] justify-evenly">
              <div
                className="absolute left-0 top-1/2 mt-[30px] flex h-[440px] w-16 -translate-y-1/2 cursor-pointer items-center justify-end md:w-[100px] xl:w-[200px]"
                onClick={() => handleClick(facade - 1 + slides.length)}
              >
                <div className="flex items-center justify-center">
                  <div className="absolute z-10 h-3 w-3 rounded-full bg-white" />
                  <FaCirclePlay
                    color="gray"
                    className="z-20 h-6 w-6 rotate-180"
                  />
                </div>
              </div>

              <div className="flex w-[448px] flex-col justify-center gap-5 pl-3 text-4xl font-bold">
                <p
                  className="text-[22px] font-medium leading-[130%]"
                  style={{ color: courseTextcolors[slide.type] }}
                >
                  {slide.subDescription}
                </p>
                <p
                  className="whitespace-pre-line text-4xl font-bold leading-[120%] text-transparent md:text-[42px]"
                  style={{
                    background: slide.mainDescriptionColor,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  {slide.mainDescription}
                </p>
                {course ? (
                  <Button
                    variant="outline"
                    className={cn(
                      'mt-2 w-[209px] gap-[6px] rounded-full bg-transparent font-medium'
                    )}
                    style={{
                      borderColor: courseTextcolors[slide.type],
                      color: courseTextcolors[slide.type]
                    }}
                    onClick={() => router.push(`/course/${course.id}`)}
                  >
                    {slide.buttonDescription}
                    <FaArrowRight />
                  </Button>
                ) : null}
              </div>

              <div>
                <Image
                  src={slide.img}
                  alt={slide.imgAlt}
                  width={511}
                  height={387}
                  priority
                />
              </div>

              <div
                className="absolute right-0 top-1/2 mt-[30px] flex h-[440px] w-16 -translate-y-1/2 cursor-pointer items-center justify-start md:w-[100px] xl:w-[200px]"
                onClick={() => handleClick(facade + 1)}
              >
                <div className="flex items-center justify-center">
                  <div className="absolute z-10 h-3 w-3 rounded-full bg-white" />
                  <FaCirclePlay color="gray" className="z-20 h-6 w-6" />
                </div>
              </div>

              <BannerPageDots slideType={slide.type} />

              <OvalIcon
                position="-left-[18%] top-[38%] h-[170px] w-[600px]"
                transform="rotate(-35deg)"
                backgroundColor={courseOvalIconColors[slide.type].leftup}
              />
              <OvalIcon
                position="-bottom-7 -left-[4%] h-[100px] w-[315px]"
                transform="rotate(-35deg)"
                backgroundColor={courseOvalIconColors[slide.type].leftdown}
              />
              <OvalIcon
                position="right-[10%] top-0 h-[225px] w-[750px]"
                transform="rotate(-30deg)"
                backgroundColor={courseOvalIconColors[slide.type].rightup}
              />
              <OvalIcon
                position="-bottom-20 -right-[25%] rounded-none h-[350px] w-[1200px]"
                transform="rotate(-30deg)"
                backgroundColor={courseOvalIconColors[slide.type].rightdown}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BannerPageDots({ slideType }: BannerPageDotsProps) {
  return (
    <div className="absolute bottom-9 flex gap-[7px]">
      <div
        className={cn(
          'z-10 h-[7px] w-[7px] rounded-full',
          slideType === 'recent' ? 'bg-white' : 'bg-[#A9A9A9]'
        )}
      />
    </div>
  )
}

function OvalIcon({
  position,
  transform,
  backgroundColor,
  additionalClasses
}: OvalIconProps) {
  return (
    <div
      className={cn('absolute -z-10 rounded-full', position, additionalClasses)}
      style={{
        transform,
        backgroundColor
      }}
    />
  )
}
