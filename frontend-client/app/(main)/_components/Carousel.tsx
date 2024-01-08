'use client'

import { Button } from '@/components/ui/button'
import type { Route } from 'next'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6'

interface Props {
  slides: { href: string }[]
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
    <div className="relative my-5 h-80 w-full overflow-hidden rounded-3xl bg-gray-100">
      <Link href={slides[facade].href as Route<string>}>
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute left-0 top-0 h-full w-full transition-opacity duration-1000 ease-in-out ${
              facade !== index && ' opacity-0'
            }`}
          >
            {/* TODO: 슬라이드 데이터 삽입*/}
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
