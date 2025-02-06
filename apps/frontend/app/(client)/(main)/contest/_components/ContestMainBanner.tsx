'use client'

import { Button } from '@/components/shadcn/button'
import { cn, fetcher } from '@/libs/utils'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { FaArrowRight, FaCirclePlay } from 'react-icons/fa6'

const slides = [
  {
    type: 'recent',
    subDescription: 'WELCOME TO',
    mainDescription: 'CODEDANG\nCONTEST HUB',
    buttonDescription: 'RECENT CONTEST',
    bgcolor: 'bg-[#00183E]',
    mainDescriptionColor:
      'linear-gradient(96deg, #21AEF2 -6.62%, #3AFCF5 94.83%)',
    img: '/banners/computer.png',
    imgAlt: 'Recent Contest'
  },
  {
    type: 'upcoming',
    subDescription: 'Join now, showcase your skills!',
    mainDescription: 'GET READY FOR\nUPCOMING CONTEST',
    buttonDescription: 'UPCOMING CONTEST',
    bgcolor: 'bg-[#E5EDFF]',
    mainDescriptionColor: 'linear-gradient(90deg, #2D51EA 0%, #1A2E84 100%)',
    img: '/banners/trophy-main.png',
    imgAlt: 'Upcoming Contest'
  }
]

const TextColors: { [key: string]: string } = {
  recent: '#FFFFFF',
  upcoming: '#4B63FF'
}

const OvalIconColors: {
  [key: string]: {
    leftup: string
    leftdown: string
    rightup: string
    rightdown: string
  }
} = {
  recent: {
    leftup: '#3581fa',
    leftdown: '#D2E4FF',
    rightup: '#7DAFFF',
    rightdown: '#0151D3'
  },
  upcoming: {
    leftup: '#8BAEFF',
    leftdown: '#A4BEFF',
    rightup: '#C8D9FF',
    rightdown: '#89ADFF'
  }
}

export function ContestMainBanner() {
  const [facade, setFacade] = useState(0)
  const router = useRouter()

  // 흠
  const { data } = useQuery({
    queryKey: ['mostRecentContestId'],
    queryFn: async () => {
      const res: {
        fastestUpcomingContestId: number
      } = await fetcher.get('contest/banner').json()
      return res
    }
  })

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setFacade((facade + 1) % slides.length)
  //   }, 5000)
  //   return () => clearTimeout(timer)
  // }, [facade])

  const handleClick = (next: number) => {
    setFacade(next % slides.length)
  }

  return (
    <div className="w-full xl:w-[1440px]">
      <div className="relative h-[500px] w-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={cn(
              'absolute inset-0 z-10 flex items-center justify-evenly overflow-hidden pt-11 text-white transition-opacity duration-1000 ease-in-out',
              facade !== index && 'z-0 opacity-0',
              slide.bgcolor
            )}
          >
            <div
              className="absolute left-4 top-1/2 flex h-[440px] w-[170px] -translate-y-1/2 cursor-pointer items-center justify-center"
              onClick={() => handleClick(facade - 1 + slides.length)}
            >
              <div className="absolute z-10 h-3 w-3 rounded-full bg-white" />
              <FaCirclePlay color="gray" className="z-20 h-6 w-6 rotate-180" />
            </div>

            <div className="mb-10 flex w-[448px] flex-col justify-center gap-5 pl-3 text-4xl font-bold">
              <p
                className="text-[22px] font-medium leading-[130%]"
                style={{ color: TextColors[slide.type] }}
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
                  borderColor: TextColors[slide.type],
                  color: TextColors[slide.type]
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
              className="absolute right-4 top-1/2 flex h-[440px] w-[170px] -translate-y-1/2 cursor-pointer items-center justify-center"
              onClick={() => handleClick(facade + 1)}
            >
              <div className="absolute z-10 h-3 w-3 rounded-full bg-white" />
              <FaCirclePlay color="gray" className="z-20 h-6 w-6" />
            </div>
            <div className="absolute bottom-5 flex gap-[7px]">
              <div
                className={cn(
                  'z-10 h-[7px] w-[7px] rounded-full',
                  slide.type === 'recent' ? 'bg-white' : 'bg-[#A9A9A9]'
                )}
              />
              <div
                className={cn(
                  'z-10 h-[7px] w-[7px] rounded-full',
                  slide.type === 'upcoming' ? 'bg-white' : 'bg-[#A9A9A9]'
                )}
              />
            </div>
            <div
              className="bg-primary absolute -left-[10%] top-[20%] -z-10 h-[160px] w-[300px] rounded-full"
              style={{
                transform: 'rotate(-35deg)',
                backgroundColor: OvalIconColors[slide.type].leftup
              }}
            />
            <div
              className="absolute -bottom-7 -left-[10%] -z-10 h-[100px] w-[315px] rounded-full bg-[#D2E4FF]"
              style={{
                transform: 'rotate(-35deg)',
                backgroundColor: OvalIconColors[slide.type].leftdown
              }}
            />
            <div
              className="absolute right-[2%] top-0 -z-10 h-[225px] w-[750px] rounded-full bg-[#7DAFFF]"
              style={{
                transform: 'rotate(-30deg)',
                backgroundColor: OvalIconColors[slide.type].rightup
              }}
            />
            <div
              className="absolute -bottom-10 -right-[35%] -z-10 h-[290px] w-[1200px] rounded-full bg-[#0151D3]"
              style={{
                transform: 'rotate(-30deg)',
                backgroundColor: OvalIconColors[slide.type].rightdown
              }}
            />
          </div>
        ))}
      </div>
      <div className="h-[100px]" />
    </div>
  )
}
