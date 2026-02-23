'use client'

import { Button } from '@/components/shadcn/button'
import { contestOvalIconColors, contestTextColors } from '@/libs/constants'
import { cn, fetcher } from '@/libs/utils'
import { useQuery } from '@tanstack/react-query'
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

export function ContestMainBanner() {
  const { t } = useTranslate()
  const [facade, setFacade] = useState(0)
  const router = useRouter()

  const { data } = useQuery({
    queryKey: ['mostRecentContestId'],
    queryFn: async () => {
      const res: {
        fastestUpcomingContestId: number
      } = await fetcher.get('contest/banner').json()
      return res
    }
  })

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
      type: 'recent',
      subDescription: t('welcome_to'),
      mainDescription: t('codedang_contest_hub'),
      buttonDescription: t('recent_contest'),
      bgcolor: 'bg-[#00183E]',
      mainDescriptionColor:
        'linear-gradient(96deg, #21AEF2 -6.62%, #3AFCF5 94.83%)',
      img: '/banners/computer.png',
      imgAlt: t('recent_contest_image_alt')
    },
    {
      type: 'upcoming',
      subDescription: t('join_now_showcase_your_skills'),
      mainDescription: t('get_ready_for_upcoming_contest'),
      buttonDescription: t('upcoming_contest'),
      bgcolor: 'bg-[#E5EDFF]',
      mainDescriptionColor: 'linear-gradient(90deg, #2D51EA 0%, #1A2E84 100%)',
      img: '/banners/trophy-main.png',
      imgAlt: t('upcoming_contest_image_alt')
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
                  style={{ color: contestTextColors[slide.type] }}
                >
                  {slide.subDescription}
                </p>
                <p
                  className="text-4xl font-bold leading-[120%] text-transparent md:text-[42px]"
                  style={{
                    background: slide.mainDescriptionColor,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  {slide.mainDescription}
                </p>
                {/* router대신 Link 이용? 고민 */}
                <Button
                  variant="outline"
                  className={cn(
                    'mt-2 w-[209px] gap-[6px] rounded-full font-medium hover:bg-transparent',
                    slide.bgcolor
                  )}
                  style={{
                    borderColor: contestTextColors[slide.type],
                    color: contestTextColors[slide.type]
                  }}
                  onClick={() =>
                    router.push(`/contest/${data?.fastestUpcomingContestId}`)
                  }
                >
                  {slide.buttonDescription}
                  <FaArrowRight />
                </Button>
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
                backgroundColor={contestOvalIconColors[slide.type].leftup}
              />
              <OvalIcon
                position="-bottom-7 -left-[4%] h-[100px] w-[315px]"
                transform="rotate(-35deg)"
                backgroundColor={contestOvalIconColors[slide.type].leftdown}
              />
              <OvalIcon
                position="right-[10%] top-0 h-[225px] w-[750px]"
                transform="rotate(-30deg)"
                backgroundColor={contestOvalIconColors[slide.type].rightup}
              />
              <OvalIcon
                position="-bottom-20 -right-[25%] rounded-none h-[350px] w-[1200px]"
                transform="rotate(-30deg)"
                backgroundColor={contestOvalIconColors[slide.type].rightdown}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="h-[100px]" />
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
      <div
        className={cn(
          'z-10 h-[7px] w-[7px] rounded-full',
          slideType === 'upcoming' ? 'bg-white' : 'bg-[#A9A9A9]'
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
