'use client'

import { cn } from '@/libs/utils'
import ArrowRightNarrowIcon from '@/public/icons/arrow-right-narrow.svg'
import { useState } from 'react'
import { GeneratorPage } from './GeneratorPage'
import { OutputCasePage } from './OutputCasePage'
import { ValidatorPage } from './ValidatorPage'

const SUB_TAB_INFO = [
  { label: 'Generator', text: 'INPUT 생성', Component: GeneratorPage },
  { label: 'Validator', text: '입력 검증', Component: ValidatorPage },
  { label: 'Output', text: 'OUTPUT 생성', Component: OutputCasePage }
] as const

export function InputCasePage() {
  const [subTab, setSubTab] = useState('Generator')
  const nextSubTab =
    SUB_TAB_INFO[SUB_TAB_INFO.findIndex(({ label }) => label === subTab) + 1]

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3 rounded-[12px] bg-white px-6 py-5">
        <div className="flex gap-7">
          {SUB_TAB_INFO.map(({ label, text }) => (
            <button
              key={label}
              type="button"
              onClick={() => setSubTab(label)}
              className={cn(
                'text-sub3_sb_16 transition-colors',
                subTab === label
                  ? 'text-primary-strong'
                  : 'text-color-cool-neutral-40'
              )}
            >
              {text}
            </button>
          ))}
        </div>
        <button
          type="button"
          disabled={!nextSubTab}
          onClick={() => nextSubTab && setSubTab(nextSubTab.label)}
          className="text-sub3_sb_16 text-color-cool-neutral-20 disabled:text-color-cool-neutral-60 flex items-center gap-[2px]"
        >
          다음 단계로
          <ArrowRightNarrowIcon className="size-5" />
        </button>
      </div>

      {SUB_TAB_INFO.map(({ label, Component }) => (
        <div key={label} className={cn({ hidden: subTab !== label })}>
          <Component />
        </div>
      ))}
    </div>
  )
}
