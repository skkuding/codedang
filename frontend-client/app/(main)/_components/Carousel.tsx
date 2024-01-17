'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Route } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6'

interface Props {
  slides: {
    topTitle: string
    bottomTitle: string
    sub: string
    img: string
    imgAlt: string
    color: keyof typeof bgColors
    href: string
  }[]
}

const bgColors: { [key: string]: string } = {
  green: 'bg-[#2e4e3f]',
  black: 'bg-[#333333]',
  white: 'bg-[#ffffff]',
  yellow: 'bg-[#f9de4a]',
  blue: 'bg-[#3581FA]'
}
const textColors: { [key: string]: string } = {
  green: 'text-white',
  black: 'text-white',
  white: 'text-black',
  yellow: 'text-black',
  blue: 'text-white'
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
    <div
      className={cn(
        'relative my-5 h-72 w-full overflow-hidden rounded-3xl bg-gray-100'
      )}
    >
      <Link href={slides[facade].href as Route<string>}>
        {slides.map((slide, index) => (
          <div
            key={index}
            className={cn(
              'absolute left-0 top-0 h-full w-full transition-opacity duration-1000 ease-in-out',
              facade !== index && ' opacity-0',
              bgColors[slides[index].color]
            )}
          >
            <div className="flex h-full w-full max-w-7xl flex-col-reverse justify-between gap-5 p-8 py-14 md:flex-row md:items-center md:px-14 md:py-0">
              <div
                className={cn(
                  'flex flex-col items-start justify-center gap-3',
                  textColors[slide.color]
                )}
              >
                <div>
                  <p className="mb-1 whitespace-nowrap text-2xl font-semibold md:text-3xl">
                    {slide.topTitle}
                  </p>
                  <p className="whitespace-nowrap text-2xl font-semibold md:text-3xl">
                    {slide.bottomTitle}
                  </p>
                  <p className="md:text-lg">{slide.sub}</p>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Image
                  src={slide.img}
                  alt={slide.imgAlt}
                  className="size-[150px] object-contain md:size-[250px]"
                />
              </div>
            </div>
          </div>
        ))}
      </Link>
      <div className="absolute bottom-5 left-0 right-0 flex justify-center">
        <div className="z-10 flex h-7 items-center rounded-full bg-gray-900/80 px-2.5">
          <Button
            variant="ghost"
            className="px-0 hover:bg-transparent"
            onClick={() => handleClick(facade - 1 + slides.length)}
          >
            <FaAngleLeft className="h-4 fill-white opacity-70 hover:opacity-100" />
          </Button>
          <p className="mx-1 flex gap-1 text-sm text-white">
            <span>{facade + 1}</span>
            <span className="font-thin opacity-70">/</span>
            <span>{slides.length}</span>
          </p>
          <Button
            variant="ghost"
            className="px-0 hover:bg-transparent"
            onClick={() => handleClick(facade + 1)}
          >
            <FaAngleRight className="h-4 fill-white opacity-70 hover:opacity-100" />
          </Button>
        </div>
      </div>
    </div>
  )
}
