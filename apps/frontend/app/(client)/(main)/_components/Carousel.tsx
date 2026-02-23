'use client'

import { Button } from '@/components/shadcn/button'
import { cn } from '@/libs/utils'
import ArrowIcon from '@/public/icons/arrow-icon.svg'
import { useTranslate } from '@tolgee/react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface CarouselProps {
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

export function Carousel({ slides }: CarouselProps) {
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

  const { t } = useTranslate()

  return (
    <div className="relative my-1 w-full max-w-[1380px] overflow-hidden rounded-[8px] lg:rounded-[20px]">
      {/* Desktop View */}
      <div className="hidden h-[640px] lg:flex">
        {slides.map((slide, index) => (
          <div
            key={slide.href + slide.topTitle}
            className={cn(
              'absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ease-in-out',
              facade !== index && 'z-0 opacity-0'
            )}
          >
            <Image
              src={slide.img}
              alt={slide.imgAlt}
              fill
              className="z-0 object-cover"
              unoptimized
              priority
            />
            <div className="font-pretendard absolute left-[130px] top-[150px] z-10 flex h-[344px] w-[539px] flex-col gap-[96px] tracking-[-0.03em] text-white">
              <div className="flex flex-col">
                <h1 className="text-[60px] font-medium leading-[110%] md:text-nowrap">
                  {slide.topTitle}
                </h1>
                <h2 className="text-[60px] font-medium leading-[110%] md:text-nowrap">
                  {slide.bottomTitle}
                </h2>
                <p className="mt-5 whitespace-pre-line text-[16px] font-normal leading-[150%] tracking-[-0.03em] text-[#E5E5E5]">
                  {slide.sub}
                </p>
              </div>
              <div className="flex">
                <Button className="h-[48px] w-[228px] rounded-[1000px] bg-black p-0 text-white">
                  <Link
                    href={`https://what-is-codedang.framer.website`}
                    className="flex h-full w-full items-center gap-[2px] pb-[10px] pl-[30px] pr-[24px] pt-[10px]"
                  >
                    <span className="font-pretendard text-[18px] font-medium tracking-[-0.03em]">
                      {t('what_is_codedang')}
                    </span>
                    <div className="relative flex size-[16px] scale-x-[-1] items-center justify-center">
                      <Image src={ArrowIcon} alt={t('right_arrow')} fill />
                    </div>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
        <div className="absolute left-[20px] top-0 z-20 flex h-[640px] w-[80px] items-center justify-center">
          <Button
            variant="ghost"
            className="h-10 p-0 hover:bg-transparent active:bg-transparent"
            onClick={() => handleClick(facade - 1 + slides.length)}
          >
            <div className="relative flex h-[40px] w-[40px] items-center justify-center">
              <Image src={ArrowIcon} alt={t('left_arrow')} fill />
            </div>
          </Button>
        </div>
        <div className="absolute right-[20px] top-0 z-20 flex h-[640px] w-[80px] items-center justify-center">
          <Button
            variant="ghost"
            className="h-10 p-0 hover:bg-transparent active:bg-transparent"
            onClick={() => handleClick(facade + 1)}
          >
            <div className="relative flex h-[40px] w-[40px] scale-x-[-1] items-center justify-center">
              <Image src={ArrowIcon} alt={t('right_arrow')} fill />
            </div>
          </Button>
        </div>
        <div className="absolute right-[94px] top-[560px] z-20 flex h-[28px] w-[57px] items-center justify-center rounded-full bg-black/40 px-4 py-1 backdrop-blur-md">
          <p className="font-pretendard flex items-center gap-1 text-sm font-medium leading-[140%] tracking-[-0.03em] text-white">
            <span>{facade + 1}</span>
            <span>/</span>
            <span>{slides.length}</span>
          </p>
        </div>
      </div>

      {/* Mobile View */}
      <div className="mt-[10px] px-5 lg:hidden">
        <div className="h-[164px] w-full rounded-[8px] bg-[#0C1421]">
          <div className="px-4 py-7">
            <p className="mb-2 text-xl font-medium leading-normal text-white">
              {t('your_coding_journey')}
              <br /> {t('starts_here')}
            </p>
            <p className="text-color-neutral-90 text-xs font-normal leading-tight">
              {t('compete_grow_skku_coding')}
            </p>
          </div>
        </div>
        <div className="flex h-[30px] items-center justify-center gap-[6px]">
          <div className="bg-primary h-[6px] w-[6px] rounded-full" />
          <div className="bg-color-neutral-90 h-[6px] w-[6px] rounded-full bg-black" />
          <div className="bg-color-neutral-90 h-[6px] w-[6px] rounded-full bg-black" />
        </div>
      </div>
    </div>
  )
}
