import { Button } from '@/components/shadcn/button'
import { cn } from '@/libs/utils'
import Image from 'next/image'
import React from 'react'

export function ContestSubBanner() {
  return (
    <div
      className="relative flex h-[328px] w-full items-center justify-center overflow-hidden lg:w-[1440px] xl:w-screen"
      style={{
        background: 'linear-gradient(90deg, #0061FF 0%, #BACFFF 100%)'
      }}
    >
      <div className="flex h-full w-[90%] items-center justify-around">
        <div className="z-10 mt-2 flex h-56 flex-col justify-evenly pl-12 text-white">
          <p className="text-xl font-semibold leading-[120%] md:text-[34px]">
            Turn Your Ideas <br />
            into a Contest on CODEDANG!
          </p>
          <p className="-mt-3 text-neutral-50">
            You&apos;re just one admin approval away from create contest
          </p>
          {/* TODO: contest 개최 방법 공지사항으로 링크하기(아직 공지사항 존재하지 않음) */}
          <Button
            variant="outline"
            className="text-primary-strong mt-2 w-[150px] rounded-full font-medium"
          >
            Read more
          </Button>
        </div>
        <div className="z-10">
          <Image
            src={'/banners/trophy-sub.png'}
            alt={'Trophy'}
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
  )
}

function BackgroundCircle({ className }: { className: string }) {
  return <div className={cn('absolute rounded-full bg-[#D4E5FF]', className)} />
}
