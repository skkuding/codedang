import { Button } from '@/components/shadcn/button'
import Image from 'next/image'
import React from 'react'
import { FaArrowRight } from 'react-icons/fa6'

const slides = [
  {
    type: 'recent',
    subDescription: 'WELCOME TO',
    mainDescription: 'CODEDANG CONTEST HUB',
    img: '/banners/computer.png',
    imgAlt: 'Recent Contest',
    href: '/contest'
  },
  {
    type: 'upcoming',
    topTitle: 'Contribute to',
    bottomTitle: 'Codedang on GitHub',
    sub: 'Our project is open source',
    img: '/banners/github.png',
    imgAlt: 'GitHub',
    href: 'https://github.com/skkuding/codedang'
  }
]

export function ContestMainCover() {
  return (
    <div className="w-full lg:w-[1440px]">
      <div className="flex h-[500px] w-full items-center justify-around border-solid bg-[#00183E] pb-5 pt-[91px]">
        <div className="flex h-56 flex-col gap-5 pl-12 text-white">
          <p className="text-[22px] font-medium leading-[130%]">WELCOME TO</p>
          <p
            className="text-[42px] font-bold leading-[120%] text-transparent"
            style={{
              background:
                'linear-gradient(96deg, #21AEF2 -6.62%, #3AFCF5 94.83%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            CODEDANG <br />
            CONTEST HUB
          </p>
          <Button
            variant="outline"
            className="mt-2 w-full gap-[6px] rounded-full border-white bg-[#00183E] font-medium text-white hover:bg-[#00183E] md:w-[209px]"
          >
            RECENT CONTEST
            <FaArrowRight />
          </Button>
        </div>
        <div>
          <Image
            src={'/banners/computer.png'}
            alt={'Computer'}
            width={511}
            height={387}
            priority
          />
        </div>
      </div>
      <div className="h-[100px]" />
    </div>
  )
}
