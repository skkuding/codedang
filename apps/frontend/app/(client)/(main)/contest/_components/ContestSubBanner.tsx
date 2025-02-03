import { Button } from '@/components/shadcn/button'
import Image from 'next/image'
import React from 'react'
import { FaArrowRight } from 'react-icons/fa6'

export function ContestSubBanner() {
  return (
    <div className="w-full lg:w-[1440px]">
      <div
        className="mt-[120px] flex h-[328px] w-full items-center justify-around"
        style={{
          background: 'linear-gradient(90deg, #0061FF 0%, #BACFFF 100%)'
        }}
      >
        <div className="flex h-56 flex-col gap-5 pl-12 text-white">
          <p className="text-[34px] font-semibold leading-[120%]">
            Turn Your Ideas <br />
            into a Contest on CODEDANG!
          </p>
          <p className="text-neutral-50">
            You&apos;re just one admin approval away from create contest
          </p>
          <Button
            variant="outline"
            className="text-primary-strong mt-2 w-full rounded-full font-medium md:w-[150px]"
          >
            Read more
          </Button>
        </div>
        <div>
          <Image
            src={'/banners/trophy-sub.png'}
            alt={'Trophy'}
            width={338}
            height={290}
            priority
          />
        </div>
      </div>
    </div>
  )
}
