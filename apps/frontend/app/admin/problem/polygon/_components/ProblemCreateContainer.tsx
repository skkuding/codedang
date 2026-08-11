'use client'

import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { cn } from '@/libs/utils'
import ArrowRightNarrowIcon from '@/public/icons/arrow-right-narrow.svg'
import PenIcon from '@/public/icons/pen.svg'
import { ErrorBoundary, Suspense } from '@suspensive/react'
import { useState } from 'react'
import { AiFillFile } from 'react-icons/ai'
import { BsPeopleFill } from 'react-icons/bs'
import { FaBook } from 'react-icons/fa'
import { FaSquareCheck } from 'react-icons/fa6'
import { CheckerPage } from './CheckerPage'
import { CollaborationPage } from './CollaborationPage'
import { ProblemCreateContentSkeleton } from './ProblemCreateSkeletons'
import { SolutionPage } from './SolutionPage'
import { StatementPage } from './StatementPage'
import { TestCasePage } from './TestCasePage'

export function ProblemCreateContainer() {
  const BASIC_TAB_INFO = [
    {
      Icon: AiFillFile,
      label: 'Statement',
      text: '문제 본문',
      subText: '문제의 세부 설명 작성',
      Component: StatementPage
    },
    {
      Icon: PenIcon,
      label: 'Solution',
      text: '솔루션 업로드',
      subText: '솔루션 업로드 및 테스트 검증',
      Component: SolutionPage
    },
    {
      Icon: FaBook,
      label: 'Tests',
      text: '테스트 케이스 관리',
      subText: 'Input · Output 생성 및 입력 검증',
      Component: TestCasePage
    },
    {
      Icon: BsPeopleFill,
      label: 'Collaboration',
      text: '협업자 초대',
      subText: '협업자 초대 및 요청 승인',
      Component: CollaborationPage
    }
  ] as const

  const SPECIAL_TAB_INFO = [
    {
      Icon: AiFillFile,
      label: 'Statement',
      text: '문제 본문',
      subText: '문제의 세부 설명 작성',
      Component: StatementPage
    },
    {
      Icon: PenIcon,
      label: 'Solution',
      text: '솔루션 업로드',
      subText: '솔루션 업로드 및 테스트 검증',
      Component: SolutionPage
    },
    {
      Icon: FaBook,
      label: 'Tests',
      text: '테스트 케이스 관리',
      subText: 'Input · Output 생성 및 입력 검증',
      Component: TestCasePage
    },
    {
      Icon: FaSquareCheck,
      label: 'Checker',
      text: '특수 채점 설정',
      subText: '고급 채점 로직 설정',
      Component: CheckerPage
    },
    {
      Icon: BsPeopleFill,
      label: 'Collaboration',
      text: '협업자 초대',
      subText: '협업자 초대 및 요청 승인',
      Component: CollaborationPage
    }
  ] as const

  // TODO: isSpecialJudgeEnabled를 useSuspenseQuery로 받아오는 데이터로 변경하기
  const isSpecialJudgeEnabled = true
  const TAB_INFO = isSpecialJudgeEnabled ? SPECIAL_TAB_INFO : BASIC_TAB_INFO

  // ---- TODO END ----

  const [tab, setTab] = useState('Statement')

  return (
    <div className="px-29 mt-30 flex w-[1208px] flex-col gap-12">
      <div className="flex h-24 flex-col items-start justify-start gap-4 self-stretch">
        <p className="text-head1_b_40">PROBLEM CREATE</p>

        <div className="flex items-center gap-3">
          {TAB_INFO.map(({ label, text }, idx) => {
            const curTab = tab === label

            return (
              <div key={label} className="flex items-center gap-3">
                <button
                  type="button"
                  className="flex items-center gap-2"
                  onClick={() => setTab(label)}
                >
                  <div
                    className={cn(
                      'flex size-6 items-center justify-center rounded-full',
                      {
                        'bg-primary': curTab,
                        'bg-color-cool-neutral-60': !curTab
                      }
                    )}
                  >
                    <p className="text-caption1_sb_14 text-color-common-100">
                      {idx + 1}
                    </p>
                  </div>
                  <p
                    className={cn('text-body1_m_18', {
                      'text-primary': curTab,
                      'text-color-cool-neutral-30': !curTab
                    })}
                  >
                    {text}
                  </p>
                </button>
                {idx < SPECIAL_TAB_INFO.length - 1 && (
                  <div className="bg-color-cool-neutral-60 h-0.5 w-4" />
                )}
              </div>
            )
          })}
        </div>
      </div>
      <div className="flex gap-10">
        <div className="border-1 border-color-cool-neutral-90 flex h-fit w-72 flex-col rounded-xl bg-white p-2">
          {TAB_INFO.map(({ Icon, label, text, subText }) => {
            const curTab = tab === label

            return (
              <div
                className={cn(
                  'flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-4',
                  {
                    'bg-color-neutral-99': curTab,
                    'hover:bg-color-neutral-99/40': !curTab
                  }
                )}
                key={label}
                onClick={() => setTab(label)}
              >
                <div className="flex items-start gap-3">
                  <div className="grid size-5 place-items-center">
                    <Icon
                      height={15}
                      className={cn({
                        'scale-x-[-1]': label === 'Collaboration',
                        'text-color-cool-neutral-40': curTab,
                        'text-color-cool-neutral-70': !curTab
                      })}
                    />
                  </div>
                  <div className="flex flex-col gap-[2px]">
                    <p
                      className={cn('text-sub3_sb_16', {
                        'text-color-common-0': curTab,
                        'text-color-cool-neutral-30': !curTab
                      })}
                    >
                      {text}
                    </p>
                    <p className="text-caption3_r_13 text-color-cool-neutral-40">
                      {subText}
                    </p>
                  </div>
                </div>
                <ArrowRightNarrowIcon
                  alt="arrow right dimgray"
                  className="text-color-cool-neutral-30 h-5"
                />
              </div>
            )
          })}
        </div>
        {TAB_INFO.map(({ label, Component }) => (
          <div key={label} className={cn('flex-1', { hidden: tab !== label })}>
            <ErrorBoundary fallback={FetchErrorFallback}>
              <Suspense fallback={<ProblemCreateContentSkeleton />}>
                <Component />
              </Suspense>
            </ErrorBoundary>
          </div>
        ))}
      </div>
    </div>
  )
}
