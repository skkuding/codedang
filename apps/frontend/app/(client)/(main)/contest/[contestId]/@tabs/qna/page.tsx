'use client'

import { Button } from '@/components/shadcn/button'
import { useState } from 'react'
import { DetailQna } from './_components/DetailQna'

export default function QnaPage() {
  const [showDetailQna, setShowDetailQna] = useState(false)

  const handleBackToList = () => {
    setShowDetailQna(false)
  }

  if (showDetailQna) {
    return <DetailQna onBackToList={handleBackToList} />
  }

  return (
    <div className="flex w-full flex-col items-center justify-center p-8">
      <h2 className="mb-6 text-2xl font-medium text-black">Q&A</h2>
      <Button
        onClick={() => setShowDetailQna(true)}
        className="h-[46px] px-6 py-3"
      >
        <span className="text-base font-medium text-white">
          Post New Question
        </span>
      </Button>
    </div>
  )
}
