import { cn } from '@/libs/utils'
import Image from 'next/image'
import React from 'react'

export function CourseSubBanner() {
  return (
    <>
      <div className="h-[120px]" />
      <div
        className="relative flex h-[328px] w-full items-center justify-center overflow-hidden lg:w-[1440px] xl:w-screen"
        style={{
          background: 'linear-gradient(90deg, #7F7DFF 0%, #D1B9FF 100%)'
        }}
      >
        <div className="flex h-full w-[90%] items-center justify-around">
          <div className="z-10 mt-2 flex h-56 flex-col justify-evenly pl-12 text-white">
            <p className="text-title1_sb_20 md:text-[34px]">
              Check out the assignments <br />
              assigned to you!
            </p>
            <p className="-mt-3 text-neutral-50">
              You can check the assignments assigned to each class
            </p>
            {/* TODO: 무언가 링크 연결 */}
            {/* <Button
              variant="outline"
              className="text-primary-strong mt-2 w-[150px] rounded-full text-base font-medium shadow-lg"
            >
              Read more
            </Button> */}
          </div>
          <div className="z-10">
            <Image
              src="/banners/assignment-sub.png"
              alt="assignment"
              width={338}
              height={290}
              priority
            />
          </div>

          <BackgroundCircle className="-left-[12%] -top-2/3 h-[393px] w-[393px]" />
          <BackgroundCircle className="right-[9%] h-[477px] w-[477px]" />
          <BackgroundCircle className="bottom-0 right-0 h-[181px] w-[181px]" />
        </div>
      </div>
    </>
  )
}

function BackgroundCircle({ className }: { className: string }) {
  return <div className={cn('absolute rounded-full bg-[#E7E3FF]', className)} />
}
