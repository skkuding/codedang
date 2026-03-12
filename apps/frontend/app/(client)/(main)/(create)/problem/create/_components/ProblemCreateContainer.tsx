'use client'

import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/shadcn/button'
import { cn } from '@/libs/utils'
import CheckBlueIcon from '@/public/icons/check-blue.svg'
import UploadIcon from '@/public/icons/upload-gray.svg'
import { ErrorBoundary, Suspense } from '@suspensive/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Check, X } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { AiFillFile } from 'react-icons/ai'
import { BsPeopleFill } from 'react-icons/bs'
import { FaBook, FaPen } from 'react-icons/fa'
import { FaSquareCheck } from 'react-icons/fa6'
import { PiMagnifyingGlassFill, PiWrenchFill } from 'react-icons/pi'
import { CheckerPage } from './CheckerPage'
import { CollaborationPage } from './CollaborationPage'
import { GeneratorPage } from './GeneratorPage'
import { JudgePage } from './JudgePage'
import { ProblemCreateContentSkeleton } from './ProblemCreateSkeletons'
import { StatementPage } from './StatementPage'
import { TestsPage } from './TestsPage'
import { ValidatorPage } from './ValidatorPage'

// TODO: 스켈레톤 UI 변경
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
  // TODO: text와 subText 톨지 이용해서 키값 추가하기
  const TAB_INFO = [
    {
      Icon: AiFillFile,
      label: 'Statement',
      text: '문제 본문',
      subText: '제목, 내용, 입출력, 샘플',
      state: 1,
      Component: StatementPage
    },
    {
      Icon: FaBook,
      label: 'Tests',
      text: '테스트 케이스',
      subText: '입력 및 정답 (Input & Output)',
      state: 2,
      Component: TestsPage
    },
    {
      Icon: FaPen,
      label: 'Solution',
      text: '솔루션',
      subText: '솔루션 업로드 및 테스트 검증',
      state: null,
      Component: JudgePage
    },
    {
      Icon: PiWrenchFill,
      label: 'Generator',
      text: '테스트 생성',
      subText: '테스트 입력 생성',
      state: true,
      Component: GeneratorPage
    },
    {
      Icon: PiMagnifyingGlassFill,
      label: 'Validator',
      text: '입력 검증',
      subText: '입력 및 검증',
      state: null,
      Component: ValidatorPage
    },
    {
      Icon: FaSquareCheck,
      label: 'Checker',
      text: '특수 채점',
      subText: '특수 채점 기능',
      state: null,
      Component: CheckerPage
    },
    {
      Icon: BsPeopleFill,
      label: 'Collaboration',
      text: '협업',
      subText: '요청 승인 및 거절',
      state: 3,
      Component: CollaborationPage
    }
  ] as const

  const problemProgress = 'published' as 'draft' | 'ready' | 'published'
  const checklistCnt = 1 as number
  const [disableUpload, setDisableUpload] = useState(true)
  const [openUploadModal, setOpenUploadModal] = useState(false)

  // ---- TODO END ----

  const StateIcon = { true: <Check size={16} />, false: <X size={16} /> }

  const [tab, setTab] = useState('Statement')

  return (
    <div className="px-29 mt-14 flex w-[1440px] flex-col gap-6">
      <div className="flex items-center justify-between gap-5">
        <div className="flex flex-col gap-2">
          <p className="text-head2_b_32">PROBLEM CREATE</p>
          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-[6px]">
              <div className="flex items-center gap-3">
                <div className="border-1 border-primary rounded-sm px-[6.5px] py-1">
                  <p className="text-caption1_m_13 text-primary">
                    {problemProgress.toUpperCase()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-body2_m_14">Ready 체크리스트</p>
                  <p className="text-sub4_sb_14 text-primary">{`${checklistCnt}/6`}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={() => setDisableUpload((prev) => !prev)}
            className="itmes-center border-primary-light hover:bg-color-blue-95 flex h-12 gap-[6px] rounded-lg border-[1.4px] bg-white px-5 py-[13px]"
          >
            <Image
              src={CheckBlueIcon}
              alt="check blue icon"
              width={20}
              height={20}
            />
            <p className="text-sub3_sb_16 text-primary">저장하기</p>
          </Button>
          <Button
            onClick={() => setOpenUploadModal(true)}
            disabled={disableUpload}
            className="itmes-center border-primary-light hover:bg-color-blue-95 disabled:border-color-neutral-95 flex h-12 gap-[6px] rounded-lg border-[1.4px] bg-white px-5 py-[13px]"
          >
            <Image src={UploadIcon} alt="upload icon" width={20} height={20} />
            <p
              className={cn(
                'text-sub3_sb_16',
                disableUpload ? 'text-color-neutral-70' : 'text-primary'
              )}
            >
              문제 업로드
            </p>
          </Button>
        </div>
      </div>
      <div className="flex gap-10">
        <div className="border-1 border-color-neutral-90 flex h-fit w-64 flex-col gap-3 rounded-2xl bg-white p-3">
          {TAB_INFO.map(({ Icon, label, text, subText, state }) => {
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
                <div className="flex items-center gap-3">
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
                  <div className="flex flex-col gap-[2px]">
                    <p
                      className={cn('text-sub3_sb_16 bg-blue', {
                        'text-primary-strong': curTab,
                        'text-color-neutral-30': !curTab
                      })}
                    >
                      {text}
                    </p>
                    <p className="text-caption3_r_13">{subText}</p>
                  </div>
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
      <Modal
        open={openUploadModal}
        onOpenChange={setOpenUploadModal}
        size="lg"
        type="custom"
        title=""
        className="text-head3_sb_28!"
        primaryButton={{ text: '예', onClick: () => {} }}
      >
        <p className="text-head3_sb_28">안녕</p>
      </Modal>
    </div>
  )
}
