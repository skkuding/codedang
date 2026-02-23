import { Button } from '@/components/shadcn/button'
import { contestNoticeId } from '@/libs/constants'
import RightIcon from '@/public/icons/arrow-right-white.svg'
import { useTranslate } from '@tolgee/react'
import Image from 'next/image'
import Link from 'next/link'
import type { JSX } from 'react'

export function MiddleContestBanner() {
  const { t } = useTranslate()
  return (
    <div className="relative w-full">
      {/* Desktop View */}
      <div className="hidden h-[578px] w-full max-w-[1860px] lg:flex">
        <TextBox className={'shirink-0 z-10 h-full min-w-[38%]'} />
        <ImageBox className={'h-full flex-1'} />
      </div>
      {/* Mobile View */}
      <div className="w-full lg:hidden">
        <Link
          href={`/notice/${contestNoticeId}`}
          className="flex h-full w-full"
        >
          <div className="h-[132px] w-full bg-[#182E56] px-4 py-8">
            <div>
              <p className="mb-1 text-lg font-semibold leading-snug text-white">
                {t('take_part_realtime')} <br /> {t('coding_contest')}
              </p>
              <p className="text-color-neutral-90 text-xs font-normal leading-tight">
                {t('compete_in_realtime')}
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}

function TextBox({ className }: { className: string }) {
  const { t } = useTranslate()
  return (
    <div
      className={`flex items-center rounded-l-[20px] bg-[#182E56] pe-[140px] ps-[86px] ${className}`}
    >
      {/* 글자 + 버튼 */}
      <div className="text-background flex h-full max-h-[264px] w-full max-w-[446px] flex-col justify-between">
        {/* 글자 부분 */}
        <div className="flex h-full max-h-[164px] flex-col justify-between">
          <Text className="max-h-[96px] w-fit whitespace-nowrap text-[40px] font-semibold leading-[120%]">
            <p> {t('take_part_realtime_coding_contest')}</p>
          </Text>
          <Text className="text-background-alternative max-h-[48px] text-[16px] font-normal leading-[150%]">
            <p>
              {t('check_skills_compete_rankings')}
              <br />
              {t('make_fun_immersive')}
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
  const { t } = useTranslate()
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
          <p>{t('how_to_host_contest')}</p>
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
