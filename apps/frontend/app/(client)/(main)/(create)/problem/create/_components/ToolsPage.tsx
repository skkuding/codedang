'use client'

import { cn } from '@/libs/utils'
import { useState } from 'react'
import { FileUploadSection } from './FileUploadSection'
import { ScriptSection } from './ScriptSection'

type TabType = 'generator' | 'validator' | 'checker'

const TABS: { key: TabType; label: string }[] = [
  { key: 'generator', label: '테스트 생성' },
  { key: 'validator', label: '입력 검증' },
  { key: 'checker', label: '특수 채점' }
]

const TAB_CONFIG = {
  generator: {
    title: '테스트 생성',
    description:
      '테스트 입력을 생성하는 프로그램 및 스크립트를 업로드하세요 (최대 한 개의 파일만 업로드 가능)',
    accept: '.cpp, .py',
    emptyMessages: [
      '업로드 된 테스트 생성 프로그램이 없습니다.',
      '기본 모드에서는 없이도 배포할 수 있으며, 커스텀 채점이 필요하면 추가해주세요.'
    ]
  },
  validator: {
    title: '입력 검증',
    description:
      '잘못된 테스트를 걸러내는 용도의 입력 제약조건 검증하세요 (최대 한 개의 파일만 업로드 가능)',
    accept: '.cpp',
    emptyMessages: [
      '업로드된 입력 검증 프로그램이 없습니다.',
      '기본 모드에서는 없이도 배포할 수 있으며, 커스텀 채점이 필요하면 추가해주세요.'
    ]
  },
  checker: {
    title: '특수 채점',
    description:
      '부동소수 오차, 특수 채점 등의 출력 비교 로직을 업로드 해주세요 (최대 한 개의 파일만 업로드 가능)',
    accept: '.cpp',
    emptyMessages: [
      '업로드된 특수 채점 프로그램이 없습니다.',
      '기본 모드에서는 없이도 배포할 수 있으며, 커스텀 채점이 필요하면 추가해주세요.'
    ]
  }
}

export function ToolsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('generator')

  return (
    <div className="border-color-cool-neutral-90 rounded-[16px] border px-6 py-7">
      <div className="flex border-b">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              'text-sub3_sb_16 w-31 pb-4',
              activeTab === key
                ? 'border-primary text-primary border-b-2'
                : 'text-color-cool-neutral-40'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="px-6 py-7">
        {activeTab === 'generator' && (
          <FileUploadSection
            {...TAB_CONFIG.generator}
            className="rounded-none border-0 p-0"
          >
            <ScriptSection />
          </FileUploadSection>
        )}
        {activeTab === 'validator' && (
          <FileUploadSection
            {...TAB_CONFIG.validator}
            className="rounded-none border-0 p-0"
          />
        )}
        {activeTab === 'checker' && (
          <FileUploadSection
            {...TAB_CONFIG.checker}
            className="rounded-none border-0 p-0"
            optional
          />
        )}
      </div>
    </div>
  )
}
