// 'use client'
// import { cn } from '@/libs/utils'
import GraduationIcon from '@/public/icons/graduation_blue.svg'
import LaptopCodingIcon from '@/public/icons/laptop-coding.svg'
import NotificationIcon from '@/public/icons/notification.svg'
import PrizeIcon from '@/public/icons/prize_blue.svg'

// import { useState } from 'react'

const SERVICE_TABS = [
  'NOTICE',
  'CONTEST',
  'PROBLEM',
  'COURSE',
  'STUDY'
] as const

type ServiceTab = (typeof SERVICE_TABS)[number]

interface Feature {
  title: string
  desc: string
  icon: React.ReactNode
}

const FEATURE_LIST: Record<ServiceTab, Feature[]> = {
  NOTICE: [
    {
      title: '공지사항',
      desc: '최신 업데이트와 공지사항을 빠르게 확인할 수 있어요.',
      icon: <NotificationIcon className="text-primary h-8 w-8" />
    }
  ],
  CONTEST: [
    {
      title: '대회',
      desc: '대회 개최와 참가를 통해 실력을 겨루고 성장해보세요.',
      icon: <PrizeIcon />
    }
  ],
  PROBLEM: [
    {
      title: '문제 풀이',
      desc: '다양한 난이도와 주제별 문제를 풀며 실전 감각을 키울 수 있어요.',
      icon: <LaptopCodingIcon className="text-primary h-9 w-9" />
    }
  ],
  COURSE: [
    {
      title: '강의 지원',
      desc: '강의와 연계된 과제 및 실습으로 체계적으로 학습해보세요.',
      icon: <GraduationIcon />
    }
  ],
  STUDY: []
}

const features = SERVICE_TABS.flatMap((tab) => FEATURE_LIST[tab])

export function ServiceCards() {
  // const [selectedTab, setSelectedTab] = useState<ServiceTab>('CONTEST')
  // const features = FEATURE_LIST[selectedTab]

  return (
    <section className="font-pretendard flex w-full flex-col items-center px-5 md:px-0">
      <div className="flex w-full max-w-[1440px] flex-col gap-7 md:gap-6">
        <div className="flex w-full flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <p className="text-title2_m_20 md:text-head1_b_40">
            코드당에는 어떤 기능이 있나요?
          </p>

          {/*
          <div className="h-[58px] w-full items-center rounded-full bg-white p-1.5 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)] md:w-auto">
            <div className="flex w-max items-center">
              {SERVICE_TABS.filter((tab) => FEATURE_LIST[tab].length > 0).map(
                (tab) => (
                  <button
                    key= {tab}
                    type="button"
                    className={cn(
                      'text-body1_m_16 w-30 flex h-[46px] items-center justify-center rounded-full px-4 py-2.5 transition-colors',
                      selectedTab === tab
                        ? 'bg-color-cool-neutral-15 text-white'
                        : 'hover:bg-[#F1F4F6]'
                    )}
                    onClick={() => setSelectedTab(tab)}
                  >
                    {tab}
                  </button>
                )
              )}
            </div>
          </div>
          */}
        </div>

        <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex min-h-[203px] w-full flex-col rounded-xl bg-white px-[26px] py-6 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)]"
            >
              <p className="text-head3_sb_28 mb-2 whitespace-nowrap break-keep">
                {feature.title}
              </p>
              <p className="text-sub2_m_18 mb-4 line-clamp-2 break-keep text-[#5F6566]">
                {feature.desc}
              </p>
              <p className="flex w-full justify-end">{feature.icon}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
