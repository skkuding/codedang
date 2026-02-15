'use client'

import { Button } from '@/components/shadcn/button'
import { cn } from '@/libs/utils'
import { Check, X } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import type { IconType } from 'react-icons'
import { AiFillFile } from 'react-icons/ai'
import { BsPeopleFill } from 'react-icons/bs'
import { FaBook, FaPen } from 'react-icons/fa'
import { FaSquareCheck } from 'react-icons/fa6'
import { FiUpload } from 'react-icons/fi'
import { PiMagnifyingGlassFill, PiWrenchFill } from 'react-icons/pi'

type ProgressType = 'draft' | 'ready' | 'published'

export default function ProblemCreatePage() {
  // TODO: 백엔드에서 받아오는 데이터로 변경하기 (TAB_INFO는 state만)
  const TAB_INFO: {
    Icon: IconType
    label: string
    state: boolean | number | null
  }[] = [
    { Icon: AiFillFile, label: 'Statement', state: 1 },
    { Icon: FaBook, label: 'Tests', state: 2 },
    { Icon: FaPen, label: 'Judge', state: null },
    { Icon: PiWrenchFill, label: 'Generator', state: true },
    { Icon: PiMagnifyingGlassFill, label: 'Validator', state: null },
    { Icon: FaSquareCheck, label: 'Checkor', state: null },
    { Icon: BsPeopleFill, label: 'Collaboration', state: 3 },
    { Icon: FiUpload, label: 'Deploy', state: null }
  ]

  const problemTitle = '2026-01-31 19:00'
  const problemProgress = 'ready' as ProgressType
  const checklistCnt = 3 as number
  const checklistDone = checklistCnt === 6

  // ---- END ----

  const StateIcon = { true: <Check size={16} />, false: <X size={16} /> }

  const [tab, setTab] = useState('Statement')

  return (
    <div className="mt-15 flex grid w-full justify-center leading-6 tracking-[-0.03em]">
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
          <div className="border-1 border-color-neural-90 flex w-64 flex-col gap-3 rounded-2xl bg-white p-3">
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
          <div className="border-1 flex-1">여기가 페이지 위치</div>
        </div>
      </div>
    </div>
  )
}
