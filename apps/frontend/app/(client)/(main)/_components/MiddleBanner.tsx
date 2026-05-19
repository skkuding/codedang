'use client'

import { Button } from '@/components/shadcn/button'
import Link from 'next/link'

export function MiddleBanner() {
  return (
    <div className="md:h-70 flex h-[130px] w-full max-w-[1360px] self-center overflow-hidden bg-[url(/banners/middle-banner.png)] md:rounded-[20px]">
      <div className="flex flex-col justify-start px-10 pt-6 md:justify-center md:px-[60px] md:pt-0">
        <h2 className="md:text-head2_b_32 text-sub1_sb_18 text-color-common-100 mb-3">
          코딩 문제, 직접 만들어보세요
        </h2>
        <p className="text-body3_r_16 text-color-neutral-99 mb-8 hidden max-w-[500px] whitespace-pre-line md:flex">
          {
            '학습 목적에 맞게 문제를 설계하고 협업자를 초대하여 피드백을 받아\n효과적인 코딩 문제를 구성해보세요.'
          }
        </p>
        <Link href="/problem/create" className="hidden w-fit md:flex">
          <Button className="bg-color-common-100 hover:bg-color-neutral-99 h-12 rounded-full px-6 py-3">
            <span className="text-sub3_sb_16 text-color-common-0">
              문제 생성 바로가기
            </span>
          </Button>
        </Link>
      </div>
    </div>
  )
}
