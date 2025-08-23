'use client'

import { useRef, useState, useEffect } from 'react'
import { CreateQnaTextArea } from './CreateQnaTextArea'
import { ReplyQnaArea } from './ReplyQnaArea'

interface QnaLayoutProps {
  contestId: number
  problemId: number
  problemOrder: number | null
}

export function QnaLayout({
  contestId,
  problemId,
  problemOrder
}: QnaLayoutProps) {
  const qnaInputRef = useRef<HTMLDivElement>(null)
  const [qnaInputHeight, setQnaInputHeight] = useState(0)

  useEffect(() => {
    if (qnaInputRef.current) {
      setQnaInputHeight(qnaInputRef.current.offsetHeight)
    }
  }, [])

  return (
    <div className="flex h-full flex-col bg-[#222939]">
      <div ref={qnaInputRef}>
        <CreateQnaTextArea problemOrder={problemOrder} contestId={contestId} />
      </div>
      <hr className="border-4 border-[#121728]" />
      <ReplyQnaArea
        contestId={contestId}
        problemId={problemId}
        qnaInputHeight={qnaInputHeight}
      />
    </div>
  )
}
