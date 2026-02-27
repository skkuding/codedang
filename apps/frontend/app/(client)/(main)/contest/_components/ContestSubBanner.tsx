import { Button } from '@/components/shadcn/button'
import { contestNoticeId } from '@/libs/constants'
import { cn } from '@/libs/utils'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export function ContestSubBanner() {
  return (
    <>
      <div className="h-[120px]" />
      <div
        className="relative flex h-[328px] w-full items-center justify-center overflow-hidden lg:w-[1440px] xl:w-screen"
        style={{
          background: 'linear-gradient(90deg, #0061FF 0%, #BACFFF 100%)'
        }}
      >
        <div className="flex h-full w-[90%] items-center justify-around">
          <div className="z-10 mt-2 flex h-56 flex-col justify-evenly pl-12 text-white">
            <p className="text-title1_sb_20 md:text-[34px]">
              Turn Your Ideas <br />
              into a Contest on CODEDANG!
            </p>
            <p className="-mt-3 text-neutral-50">
              You&apos;re just one admin approval away from create contest
            </p>
            <Link href={`/notice/${contestNoticeId}`}>
              <Button
                variant="outline"
                className="text-primary-strong text-body1_m_16 mt-2 w-[150px] rounded-full shadow-lg"
              >
                Read more
              </Button>
            </Link>
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
    </>
  )
}

function BackgroundCircle({ className }: { className: string }) {
  return <div className={cn('absolute rounded-full bg-[#D4E5FF]', className)} />
}
