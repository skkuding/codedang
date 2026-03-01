'use client'

import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Button } from '@/components/shadcn/button'
import { cn } from '@/libs/utils'
import { ErrorBoundary, Suspense } from '@suspensive/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Check, X } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { AiFillFile } from 'react-icons/ai'
import { BsPeopleFill } from 'react-icons/bs'
import { FaBook, FaPen } from 'react-icons/fa'
import { FaSquareCheck } from 'react-icons/fa6'
import { FiUpload } from 'react-icons/fi'
import { PiMagnifyingGlassFill, PiWrenchFill } from 'react-icons/pi'
import { CheckerPage } from './CheckerPage'
import { CollaborationPage } from './CollaborationPage'
import { DeployPage } from './DeployPage'
import { GeneratorPage } from './GeneratorPage'
import { JudgePage } from './JudgePage'
import { ProblemCreateContentSkeleton } from './ProblemCreateSkeletons'
import { StatementPage } from './StatementPage'
import { TestsPage } from './TestsPage'
import { ValidatorPage } from './ValidatorPage'

export function ProblemCreateContainer() {
  // 스켈레톤 확인을 위한 더미코드
  useSuspenseQuery({
    queryKey: ['SongKangGyu'],
    queryFn: () =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve('hi')
        }, 3000)
      })
  })

  // TODO: useSuspenseQuery를 사용해서 백엔드에서 받아오는 데이터로 변경하기 (TAB_INFO는 state만)
  const TAB_INFO = [
    {
      Icon: AiFillFile,
      label: 'Statement',
      state: 1,
      Component: StatementPage
    },
    { Icon: FaBook, label: 'Tests', state: 2, Component: TestsPage },
    { Icon: FaPen, label: 'Judge', state: null, Component: JudgePage },
    {
      Icon: PiWrenchFill,
      label: 'Generator',
      state: true,
      Component: GeneratorPage
    },
    {
      Icon: PiMagnifyingGlassFill,
      label: 'Validator',
      state: null,
      Component: ValidatorPage
    },
    {
      Icon: FaSquareCheck,
      label: 'Checker',
      state: null,
      Component: CheckerPage
    },
    {
      Icon: BsPeopleFill,
      label: 'Collaboration',
      state: 3,
      Component: CollaborationPage
    },
    { Icon: FiUpload, label: 'Deploy', state: null, Component: DeployPage }
  ] as const

  const problemTitle = '2026-01-31 19:00'
  const problemProgress = 'ready' as 'draft' | 'ready' | 'published'
  const checklistCnt = 1 as number
  const checklistDone = checklistCnt === 6

  // ---- TODO END ----

  const StateIcon = { true: <Check size={16} />, false: <X size={16} /> }

  const [tab, setTab] = useState('Statement')

  return (
    <div className="px-29 gap-17 mt-14 flex w-[1440px] flex-col">
      <div className="flex flex-col gap-6">
        <p className="text-4xl font-bold">{problemTitle}</p>
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-[6px]">
            <div className="flex gap-2">
              <Image
                src={
                  {
                    draft: '/icons/progress.svg',
                    ready: '/icons/progress-green.svg',
                    published: '/icons/progress-blue.svg'
                  }[problemProgress]
                }
                width={20}
                height={20}
                alt="progress icon"
              />
              <p
                className={cn('text-base font-medium capitalize', {
                  'text-color-green-40': problemProgress === 'ready',
                  'text-primary': problemProgress === 'published'
                })}
              >
                {problemProgress}
              </p>
            </div>
            <div className="flex gap-2">
              <Image
                src={
                  checklistDone ? '/icons/check-blue.svg' : '/icons/info.svg'
                }
                width={20}
                height={20}
                alt="progress icon"
              />
              <p
                className={cn('text-error text-base font-medium', {
                  'text-primary-strong': checklistDone
                })}
              >
                {`${checklistCnt}/6`}
              </p>
            </div>
          </div>
          <Button className="itmes-center flex h-[49px] gap-3 px-[22.5px] py-3">
            <AiFillFile size={20} />
            <p className="text-lg">Save</p>
          </Button>
        </div>
      </div>
      <div className="flex gap-10">
        <div className="border-1 border-color-neutral-90 flex h-fit w-64 flex-col gap-3 rounded-2xl bg-white p-3">
          {TAB_INFO.map(({ Icon, label, state }) => {
            const curTab = tab === label

            return (
              <div
                className={cn(
                  'flex w-full cursor-pointer items-center justify-between rounded-xl p-3',
                  {
                    'bg-color-blue-95': curTab,
                    'hover:bg-color-neutral-99': !curTab
                  }
                )}
                key={label}
                onClick={() => setTab(label)}
              >
                <div className="flex items-center gap-2">
                  <div className="grid size-6 place-items-center">
                    <Icon
                      size={20}
                      className={cn({
                        'scale-x-[-1]':
                          label === 'Generator' || label === 'Collaboration',
                        'text-primary': curTab,
                        'text-color-neutral-80': !curTab
                      })}
                    />
                  </div>
                  <p
                    className={cn('text-lg font-medium', {
                      'text-primary-strong': curTab,
                      'text-color-neutral-30': !curTab
                    })}
                  >
                    {label}
                  </p>
                </div>
                {state !== null && (
                  <div
                    className={cn(
                      'grid size-6 place-items-center rounded-full',
                      {
                        'text-primary bg-white': curTab,
                        'text-color-neutral-40 bg-color-neutral-99': !curTab
                      }
                    )}
                  >
                    <p className="text-xs font-medium leading-4">
                      {typeof state === 'number'
                        ? state
                        : StateIcon[`${state}`]}
                    </p>
                  </div>
                )}
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
