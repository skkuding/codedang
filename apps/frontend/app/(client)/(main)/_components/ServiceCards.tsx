'use client'

import { cn } from '@/libs/utils'
import dashboardIcon from '@/public/icons/dashboard-blue.svg'
import gradeIcon from '@/public/icons/grade-blue.svg'
import laptopCodingIcon from '@/public/icons/laptop-coding-blue.svg'
import penIcon from '@/public/icons/pen-blue.svg'
import Image from 'next/image'
import { useState } from 'react'

const SERVICE_TABS = [
  'NOTICE',
  'CONTEST',
  'PROBLEM',
  'COURSE',
  'STUDY'
] as const

type ServiceTab = (typeof SERVICE_TABS)[number]

const FEATURE_LIST: Record<
  ServiceTab,
  {
    title: string
    desc: string
    icon: string
  }[]
> = {
  NOTICE: [],
  CONTEST: [
    {
      title: '실시간 리더보드',
      desc: '콘테스트 중에도, 실시간 리더보드를 통해 나의 순위를 파악할 수 있어요',
      icon: dashboardIcon
    },
    {
      title: '유동적인 특수 채점',
      desc: '특정 조건 문제에 대해서도 다양한 답변을 평가할 수 있어요',
      icon: penIcon
    },
    {
      title: '사용자 정의 테스트케이스',
      desc: '제출 전, 페널티 시스템에 영향을 주지 않는 다양한 입력을 추가할 수 있어요',
      icon: laptopCodingIcon
    },
    {
      title: '대회 내 통계',
      desc: '성공률, 제출 횟수 및 더 많은 통계를 확인하고 더욱 성장하세요!',
      icon: gradeIcon
    }
  ],
  PROBLEM: [],
  COURSE: [],
  STUDY: []
}

export function ServiceCards() {
  const [selectedTab, setSelectedTab] = useState<ServiceTab>('CONTEST')
  const features = FEATURE_LIST[selectedTab]

  return (
    <section className="font-pretendard flex w-full flex-col items-center px-5 md:px-0">
      <div className="flex w-full max-w-[1440px] flex-col gap-7 px-10 md:gap-6">
        <div className="flex w-full flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <p className="text-head2_b_32 md:text-head1_b_40">
            코드당에는 어떤 기능이 있나요?
          </p>

          <div className="h-[58px] w-full items-center rounded-full bg-white p-1.5 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)] md:w-auto">
            <div className="flex w-max items-center">
              {SERVICE_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={cn(
                    'text-body1__m_16 w-30 flex h-[46px] items-center justify-center rounded-full px-4 py-2.5 transition-colors',
                    selectedTab === tab
                      ? 'bg-color-cool-neutral-15 text-white'
                      : 'hover:bg-[#F1F4F6]'
                  )}
                  onClick={() => setSelectedTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex min-h-[203px] w-[331px] flex-col rounded-xl bg-white px-[26px] py-6 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)]"
            >
              <p className="text-head3_sb_28 mb-2 whitespace-nowrap break-keep">
                {feature.title}
              </p>
              <p className="text-sub2_m_18 mb-4 line-clamp-2 break-keep text-[#5F6566]">
                {feature.desc}
              </p>
              <Image
                className="mt-auto self-end"
                src={feature.icon}
                alt={feature.title}
                width={48}
                height={48}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
