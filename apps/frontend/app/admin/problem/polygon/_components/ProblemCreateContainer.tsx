'use client'

import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { cn } from '@/libs/utils'
import CheckIcon from '@/public/icons/check-circle.svg'
import FileIcon from '@/public/icons/file-thin.svg'
import ListBoxIcon from '@/public/icons/list-box.svg'
import PenIcon from '@/public/icons/pen.svg'
import PeopleIcon from '@/public/icons/people.svg'
import UploadIcon from '@/public/icons/upload.svg'
import { ErrorBoundary, Suspense } from '@suspensive/react'
import { useState } from 'react'
import { CheckerPage } from './CheckerPage'
import { CollaborationPage } from './CollaborationPage'
import { ProblemCreateContentSkeleton } from './ProblemCreateSkeletons'
import { SolutionPage } from './SolutionPage'
import { StatementPage } from './StatementPage'
import { TestCasePage } from './TestCasePage'
import { UploadButton } from './UploadButton'

export function ProblemCreateContainer() {
  const BASIC_TAB_INFO = [
    {
      Icon: FileIcon,
      label: 'Statement',
      text: '문제 본문',
      subText: '문제의 세부 설명 작성',
      Component: StatementPage
    },
    {
      Icon: UploadIcon,
      label: 'Solution',
      text: '솔루션 업로드',
      subText: '솔루션 업로드 및 테스트 검증',
      Component: SolutionPage
    },
    {
      Icon: ListBoxIcon,
      label: 'Tests',
      text: '테스트 케이스 관리',
      subText: 'Input · Output 생성 및 입력 검증',
      Component: TestCasePage
    },
    {
      Icon: PeopleIcon,
      label: 'Collaboration',
      text: '협업자 초대',
      subText: '협업자 초대 및 요청 승인',
      Component: CollaborationPage
    }
  ] as const

  const SPECIAL_TAB_INFO = [
    {
      Icon: FileIcon,
      label: 'Statement',
      text: '문제 본문',
      subText: '문제의 세부 설명 작성',
      Component: StatementPage
    },
    {
      Icon: UploadIcon,
      label: 'Solution',
      text: '솔루션 업로드',
      subText: '솔루션 업로드 및 테스트 검증',
      Component: SolutionPage
    },
    {
      Icon: ListBoxIcon,
      label: 'Tests',
      text: '테스트 케이스 관리',
      subText: 'Input · Output 생성 및 입력 검증',
      Component: TestCasePage
    },
    {
      Icon: PenIcon,
      label: 'Checker',
      text: '특수 채점 설정',
      subText: '고급 채점 로직 설정',
      Component: CheckerPage
    },
    {
      Icon: PeopleIcon,
      label: 'Collaboration',
      text: '협업자 초대',
      subText: '협업자 초대 및 요청 승인',
      Component: CollaborationPage
    }
  ] as const

  // TODO: isSpecialJudgeEnabled를 useSuspenseQuery로 받아오는 데이터로 변경하기
  const isSpecialJudgeEnabled = true
  const TAB_INFO = isSpecialJudgeEnabled ? SPECIAL_TAB_INFO : BASIC_TAB_INFO
  const uploadTargetTexts = [
    'meta.json// 제한시간, 메모리, 권한',
    'statement.md// 문제 본문',
    'solution.cpp// 솔루션',
    'testcase.zip// 테스트 케이스',
    ...(isSpecialJudgeEnabled ? ['checker.cpp// 특수 채점'] : [])
  ]

  // ---- TODO END ----

  const [tab, setTab] = useState('Statement')
  const currentTabIdx = TAB_INFO.findIndex(({ label }) => label === tab)

  return (
    <div className="flex w-full min-w-[1160px] max-w-[1440px] flex-col gap-12 px-10">
      <div className="flex h-24 flex-col items-start justify-start gap-4 self-stretch">
        <p className="text-head1_b_40">PROBLEM CREATE</p>

        <div className="flex items-center gap-3 whitespace-nowrap">
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
                    <p className="text-sub4_sb_14 text-color-common-100">
                      {idx + 1}
                    </p>
                  </div>
                  {
                    // Todo: p태그 글꼴이 없어서 결정되면 변경
                  }
                  <p
                    className={cn(
                      'font-["Pretendard"] text-lg font-medium leading-6',
                      {
                        'text-primary': curTab,
                        'text-color-cool-neutral-30': !curTab
                      }
                    )}
                  >
                    {text}
                  </p>
                </button>
                {idx < TAB_INFO.length - 1 && (
                  <div className="bg-color-cool-neutral-60 h-0.5 w-4" />
                )}
              </div>
            )
          })}
        </div>
      </div>
      <div className="flex items-start gap-5 self-stretch">
        <div className="min-w-[760px] flex-1">
          {TAB_INFO.map(({ label, Component }) => (
            <div
              key={label}
              className={cn('w-full', { hidden: tab !== label })}
            >
              <ErrorBoundary fallback={FetchErrorFallback}>
                <Suspense fallback={<ProblemCreateContentSkeleton />}>
                  <Component />
                </Suspense>
              </ErrorBoundary>
            </div>
          ))}
        </div>

        <div className="flex w-72 shrink-0 flex-col items-start gap-7 rounded-xl bg-white px-5 py-6">
          <div className="flex flex-col gap-6 self-stretch">
            <p className="text-head5_sb_24">발행 체크리스트</p>

            <div className="flex flex-col gap-6 self-stretch">
              {TAB_INFO.map(({ Icon, label, text, subText }, idx) => {
                const isDone = idx < currentTabIdx

                return (
                  <button
                    key={label}
                    type="button"
                    className="flex w-full items-center justify-between gap-3 text-left"
                    onClick={() => setTab(label)}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="grid size-6 shrink-0 place-items-center">
                        <Icon
                          height={24}
                          width={24}
                          className={cn({
                            'text-color-common-0': isDone,
                            'text-color-cool-neutral-50': !isDone
                          })}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <p
                          className={cn('text-sub3_sb_16', {
                            'text-color-common-0': isDone,
                            'text-color-cool-neutral-50': !isDone
                          })}
                        >
                          {text}
                        </p>
                        <p
                          className={cn('text-caption3_r_13', {
                            'text-color-cool-neutral-40': isDone,
                            'text-color-cool-neutral-60': !isDone
                          })}
                        >
                          {subText}
                        </p>
                      </div>
                    </div>
                    <CheckIcon
                      width={24}
                      height={24}
                      className={cn(
                        'grid size-6 shrink-0 place-items-center rounded-full',
                        {
                          'text-primary-strong': isDone,
                          'text-color-cool-neutral-80': !isDone
                        }
                      )}
                    />
                  </button>
                )
              })}
            </div>
          </div>

          <UploadButton
            disabled={false}
            upload_target_texts={uploadTargetTexts}
          />
        </div>
      </div>
    </div>
  )
}
