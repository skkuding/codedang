import { cn } from '@/libs/utils'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface CarouselProps {
  slides: {
    type: string
    topTitle: string
    bottomTitle: string
    sub: string
    subMobile: string
    img: string
    imgMobile: string
    imgAlt: string
    href: string
  }[]
}

export function MainBanner({ slides }: CarouselProps) {
  const [facade, setFacade] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setFacade((facade + 1) % slides.length)
    }, 5000)
    return () => clearTimeout(timer)
  }, [facade, slides])

  return (
    <div className="relative my-1 w-full max-w-[1380px] overflow-hidden rounded-[8px] lg:rounded-[20px]">
      {/* Desktop View */}
      <div className="hidden h-[640px] md:flex">
        <span>여기 작업해주세요! 다른 곳도 코드 언제든 바꾸셔도 됩니다~</span>
      </div>
      {/* Mobile View (render all slides and control visibility by facade) */}
      <div className="mt-[10px] px-[20px] md:hidden">
        <div className="relative h-[164px] w-full">
          {slides.map((slide, index) => (
            <div
              key={slide.href + slide.topTitle}
              className={cn(
                'absolute inset-0 transition-opacity duration-1000 ease-in-out',
                facade !== index && 'z-0 opacity-0'
              )}
            >
              <div className="relative h-[164px] w-full overflow-hidden rounded-[8px]">
                <Image
                  src={slide.imgMobile}
                  alt={slide.imgAlt}
                  fill
                  className="z-0 object-cover"
                  unoptimized
                  priority
                />
                <div className="font-pretendard absolute left-[17px] top-[24px] z-10 inline-flex h-[73px] w-[222px] flex-col items-start gap-[4px] text-white">
                  <p className="text-[20px] font-medium font-semibold leading-[130%] tracking-[-0.6px]">
                    {slide.topTitle}
                    <br />
                    {slide.bottomTitle}
                  </p>
                  <p className="text-color-neutral-90 text-xs font-normal leading-[140%] tracking-[-0.36px]">
                    {slide.subMobile}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
