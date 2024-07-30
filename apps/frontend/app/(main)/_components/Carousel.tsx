'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Route } from 'next'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6'

interface Props {
  slides: {
    type: string
    topTitle: string
    bottomTitle: string
    sub: string
    href: string
  }[]
}

const bgImage: { [key: string]: string } = {
  codedang: 'bg-[url(/carousel1.svg)]',
  github: 'bg-[url(/carousel2.svg)]',
  skkuding: 'bg-[url(/carousel3.svg)]'
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
    <div className="relative my-2 h-[350px] w-full overflow-hidden rounded-xl bg-gray-100 sm:h-[360px]">
      {slides.map((slide, index) => (
        <Link
          href={slide.href as Route}
          key={slide.href + slide.topTitle}
          className={cn(
            'f absolute inset-0 z-10 flex flex-col-reverse items-center justify-between gap-5 p-8 py-14 text-white transition-opacity duration-1000 ease-in-out sm:flex-row md:px-14 md:py-0',
            facade !== index && 'z-0 opacity-0',
            bgImage[slide.type]
          )}
        >
          <div className="w-full whitespace-nowrap text-2xl font-bold md:text-4xl">
            <p className="font-mono">{slide.topTitle}</p>
            <p className="font-mono">{slide.bottomTitle}</p>
            <p className="mt-4 text-base font-normal opacity-70 md:text-lg">
              {slide.sub}
            </p>
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
