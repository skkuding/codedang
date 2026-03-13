'use client'

import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/shadcn/button'
import { cn } from '@/libs/utils'
import ArrowRightIcon from '@/public/icons/arrow-right-gray.svg'
import CheckBlueIcon from '@/public/icons/check-blue.svg'
import UploadIcon from '@/public/icons/upload-gray.svg'
import { ErrorBoundary, Suspense } from '@suspensive/react'
import { useSuspenseQuery } from '@tanstack/react-query'
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
// TODO: neutral -> cool neutral
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
  // TODO: text와 subText Tolgee 이용해서 키값 추가하기
  const TAB_INFO = [
    {
      Icon: AiFillFile,
      label: 'Statement',
      text: '문제 본문',
      subText: '제목, 내용, 입출력, 샘플',
      Component: StatementPage
    },
    {
      Icon: FaBook,
      label: 'Tests',
      text: '테스트 케이스',
      subText: '입력 및 정답 (Input & Output)',
      Component: TestsPage
    },
    {
      Icon: FaPen,
      label: 'Solution',
      text: '솔루션',
      subText: '솔루션 업로드 및 테스트 검증',
      Component: JudgePage
    },
    {
      Icon: PiWrenchFill,
      label: 'Generator',
      text: '테스트 생성',
      subText: '테스트 입력 생성',
      Component: GeneratorPage
    },
    {
      Icon: PiMagnifyingGlassFill,
      label: 'Validator',
      text: '입력 검증',
      subText: '입력 및 검증',
      Component: ValidatorPage
    },
    {
      Icon: FaSquareCheck,
      label: 'Checker',
      text: '특수 채점',
      subText: '특수 채점 기능',
      Component: CheckerPage
    },
    {
      Icon: BsPeopleFill,
      label: 'Collaboration',
      text: '협업',
      subText: '요청 승인 및 거절',
      Component: CollaborationPage
    }
  ] as const

  const problemProgress = 'published' as 'draft' | 'ready' | 'published'
  const [checklistCnt, setChecklistCnt] = useState(1)
  const checklistDone = checklistCnt === 6
  const [openUploadModal, setOpenUploadModal] = useState(false)

  // ---- TODO END ----

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
                  <p className="text-body2_m_14 text-color-neutral-30">
                    Ready 체크리스트
                  </p>
                  <p className="text-sub4_sb_14 text-primary">{`${checklistCnt}/6`}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
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
            disabled={!checklistDone}
            className="itmes-center border-primary-light bg-primary! hover:bg-primary-strong! disabled:border-color-neutral-95 disabled:bg-color-neutral-95! flex h-12 gap-[6px] rounded-lg border-[1.4px] bg-white px-5 py-[13px]"
          >
            <Image src={UploadIcon} alt="upload icon" width={20} height={20} />
            <p
              className={cn(
                'text-sub3_sb_16',
                !checklistDone ? 'text-color-neutral-70' : 'text-white'
              )}
            >
              문제 업로드
            </p>
          </Button>
        </div>
      </div>
      <div className="flex gap-10">
        <div className="border-1 border-color-neutral-90 flex h-fit w-72 flex-col rounded-2xl bg-white p-2">
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
                        'scale-x-[-1]':
                          label === 'Generator' || label === 'Collaboration',
                        'text-color-neutral-40': curTab,
                        'text-color-neutral-70': !curTab
                      })}
                    />
                  </div>
                  <div className="flex flex-col gap-[2px]">
                    <p
                      className={cn('text-sub3_sb_16 bg-blue', {
                        'text-color-common-0': curTab,
                        'text-color-neutral-30': !curTab
                      })}
                    >
                      {text}
                    </p>
                    <p className="text-caption3_r_13 text-color-neutral-40">
                      {subText}
                    </p>
                  </div>
                </div>
                <Image
                  src={ArrowRightIcon}
                  alt="arrow right dimgray"
                  width={20}
                  height={20}
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
