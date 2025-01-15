'use client'

import { Button } from '@/components/shadcn/button'
import { cn } from '@/libs/utils'
import type { Route } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6'

interface Props {
  slides: {
    type: string
    topTitle: string
    bottomTitle: string
    sub: string
    img: string
    imgAlt: string
    href: string
  }[]
}

const bgColors: { [key: string]: string } = {
  codedang:
    'bg-[linear-gradient(325deg,rgba(79,86,162,0)_0%,rgba(79,86,162,0.5)_50%),linear-gradient(90deg,#3D63B8_0%,#0E1322_100%)]',
  github: 'bg-gradient-to-b from-[#161429] to-[#704FC3]',
  skkuding: 'bg-gradient-to-r from-[#41775D] to-[#123D29]'
}

export default function Carousel({ slides }: Props) {
  const [facade, setFacade] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setFacade((facade + 1) % slides.length)
    }, 5000)
    return () => clearTimeout(timer)
  }, [facade, slides])

  const handleClick = (next: number) => {
    setFacade(next % slides.length)
  }

  return (
    <div className="relative my-5 h-[466px] w-full overflow-hidden rounded-lg bg-gray-100 sm:h-[360px]">
      {slides.map((slide, index) => (
        <Link
          href={slide.href as Route}
          key={slide.href + slide.topTitle}
          className={cn(
            'absolute inset-0 z-10 flex flex-col-reverse items-center justify-between py-14 pl-6 text-white transition-opacity duration-1000 ease-in-out sm:flex-row md:pl-10',
            facade !== index && 'z-0 opacity-0',
            bgColors[slide.type]
          )}
        >
          <div className="mb-10 w-full text-4xl font-bold">
            <p className="font-mono md:text-nowrap">{slide.topTitle}</p>
            <p className="font-mono md:text-nowrap">{slide.bottomTitle}</p>
            <p className="mt-4 whitespace-nowrap text-base font-normal opacity-70 md:text-lg">
              {slide.sub}
            </p>
          </div>
          <div>
            <Image
              src={slide.img}
              alt={slide.imgAlt}
              width={554}
              height={554}
              className="absolute -right-16 bottom-48 z-[-10] mr-5 size-[330px] object-contain sm:relative sm:bottom-0 sm:left-0 sm:size-[1024px] sm:pl-0"
              priority
            />
          </div>
        </Link>
      ))}
      <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center">
        <div className="flex h-7 items-center rounded-full bg-white/60 px-2.5">
          <Button
            variant="ghost"
            className="px-0 hover:bg-transparent active:bg-transparent"
            onClick={() => handleClick(facade - 1 + slides.length)}
          >
            <FaAngleLeft className="h-4 fill-black opacity-70 hover:opacity-100" />
          </Button>
          <p className="mx-1 flex gap-1 text-sm text-black">
            <span>{facade + 1}</span>
            <span className="opacity-70">/</span>
            <span>{slides.length}</span>
          </p>
          <Button
            variant="ghost"
            className="px-0 hover:bg-transparent active:bg-transparent"
            onClick={() => handleClick(facade + 1)}
          >
            <FaAngleRight className="h-4 fill-black opacity-70 hover:opacity-100" />
          </Button>
        </div>
      </div>
    </div>
  )
}
