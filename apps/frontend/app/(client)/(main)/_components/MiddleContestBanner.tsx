import { Button } from '@/components/shadcn/button'
import { contestNoticeId } from '@/libs/constants'
import RightIcon from '@/public/icons/arrow-right-white.svg'
import Image from 'next/image'
import Link from 'next/link'
import type { JSX } from 'react'

export function MiddleContestBanner() {
  return (
    <div className="relative flex h-[518px] w-full max-w-[1208px]">
      <TextBox className={'z-10 h-full w-[609px] shrink-0'} />
      <ImageBox className={'h-full flex-1'} />
    </div>
  )
}

function TextBox({ className }: { className: string }) {
  return (
    <div
      className={`flex items-center rounded-l-[20px] bg-[#182E56] pe-[140px] ps-[60px] ${className}`}
    >
      {/* 글자 + 버튼 */}
      <div className="text-background flex h-full max-h-[264px] w-full max-w-[446px] flex-col justify-between">
        {/* 글자 부분 */}
        <div className="flex h-full max-h-[164px] flex-col justify-between">
          <Text className="max-h-[96px] w-fit whitespace-nowrap text-4xl font-semibold leading-[120%]">
            <p>
              {' '}
              TAKE PART IN REAL-TIME
              <br />
              CODING CONTEST
            </p>
          </Text>
          <Text className="text-background-alternative max-h-[48px] text-[16px] font-normal leading-[150%]">
            <p>
              Check your skills, and try to compete in the rankings.
              <br />
              Make it more fun and immersive with real-time rankings!
            </p>
          </Text>
        </div>
        {/* 버튼 부분 */}
        <BarButton />
      </div>
    </div>
  )
}

function Text({
  children,
  className
}: {
  children: JSX.Element
  className: string
}) {
  return (
    <div
      className={`sans vertical-align: middle; tracking-[-0.03em] ${className}`}
    >
      {children}
    </div>
  )
}

function BarButton() {
  return (
    <Button
      variant={'outline'}
      className="h-full max-h-[54px] w-full max-w-[291px] p-0"
    >
      <Link
        href={`/notice/${contestNoticeId}`}
        className="flex h-full w-full items-center justify-between px-[4px] py-0"
      >
        <Text className="ms-[26px] max-h-[28px] max-w-[191px] text-[20px] font-medium leading-[140%] text-black">
          <p>How to host a Contest</p>
        </Text>
        <div className="flex h-full max-h-[46px] w-full max-w-[46px] items-center justify-center rounded-full bg-black">
          <div className="text-background relative flex size-[30px] items-center justify-center">
            <Image src={RightIcon} alt="Right" fill />
          </div>
        </div>
      </Link>
    </Button>
  )
}

function ImageBox({ className }: { className: string }) {
  return (
    <div className={`relative ${className}`}>
      <ImageMask className="h-full max-h-[183px] w-full" />
      <Image
        src={'/banners/mainpage_middle_banner.png'}
        alt="middle_banner"
        fill
        style={{
          objectFit: 'cover'
        }}
        className="-z-10 rounded-r-[20px] sm:relative sm:bottom-0 sm:left-0 sm:pl-0"
      />
    </div>
  )
}

function ImageMask({ className }: { className: string }) {
  return (
    <div
      className={`from-background/50 to-background/0 bg-linear-to-b absolute right-0 top-[-48px] ${className}`}
    />
  )
}
