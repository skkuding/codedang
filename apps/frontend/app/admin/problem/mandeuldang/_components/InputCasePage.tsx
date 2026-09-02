'use client'

import { cn } from '@/libs/utils'
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

  return (
    <div>
      <div className="bg-color-cool-neutral-95 mb-6 inline-flex gap-1 rounded-full p-1">
        {SUB_TAB_INFO.map(({ label, text }) => (
          <button
            key={label}
            type="button"
            onClick={() => setSubTab(label)}
            className={cn(
              'text-sub4_sb_14 rounded-full px-4 py-2 transition-colors',
              subTab === label
                ? 'text-primary bg-white'
                : 'text-color-cool-neutral-50'
            )}
          >
            {text}
          </button>
        ))}
      </div>

      {SUB_TAB_INFO.map(({ label, Component }) => (
        <div key={label} className={cn({ hidden: subTab !== label })}>
          <Component />
        </div>
      ))}
    </div>
  )
}
