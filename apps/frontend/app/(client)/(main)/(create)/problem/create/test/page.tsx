'use client'

import { useState } from 'react'
import {
  ExecutionCard,
  type GeneratedResult,
  type StateType
} from '../_components/ExecutionCard'
import { TCDownloadCard } from '../_components/TCDownloadCard'

export default function Page() {
  const [genResult, setGenResult] = useState<GeneratedResult>({
    state: 'FAIL',
    date: new Date(2020, 1, 1),
    totalCnt: 2,
    successCnt: 2
  })

  const [loading, setLoading] = useState<boolean>(false)

  // 임시 생성하기 버튼 동작 함수: 문제 생성 상태 변경
  const onGenerate = () => {
    setLoading(true)
    setTimeout(() => {
      setGenResult((prev) => {
        const nextState: StateType = (
          {
            SUCCESS: 'FAIL',
            FAIL: 'NONE',
            NONE: 'SUCCESS'
          } as const
        )[prev.state]

        return { ...prev, state: nextState }
      })
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="mt-20 flex w-[900px] flex-col gap-2">
      <ExecutionCard
        disabled={loading}
        loading={loading}
        genResult={genResult}
        onGenerate={onGenerate}
        canDownload
      />
      <TCDownloadCard
        onDelete={() => alert('Delete')}
        onDownload={() => alert('Download')}
        disabled={loading}
      />
    </div>
  )
}
