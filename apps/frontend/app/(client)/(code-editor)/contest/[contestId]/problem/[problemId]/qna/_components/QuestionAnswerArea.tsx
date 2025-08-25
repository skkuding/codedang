'use client'

import { useQnaCommentsSync } from '@/app/(client)/(code-editor)/_components/context/RefetchingQnaCommentsStoreProvider'
import { fetcherWithAuth } from '@/libs/utils'
import type { MultipleQnaData, SingleQnaData } from '@/types/type'
import Image from 'next/image'
import { useEffect, useState, useCallback } from 'react'
import { FaCircleExclamation } from 'react-icons/fa6'
import { QnaAccordion } from './QnaAccordion'

interface QuestionAnswerAreaProps {
  contestId: number
  problemId: number
}

export function QuestionAnswerArea({
  contestId,
  problemId
}: QuestionAnswerAreaProps) {
  const [loading, setLoading] = useState(true)
  const [qnaDetails, setQnaDetails] = useState<SingleQnaData[]>([])
  const [error, setError] = useState<string | null>(null)
  const refreshTrigger = useQnaCommentsSync((s) => s.refreshTrigger)

  const fetchQnaData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const allqnaData = await fetcherWithAuth
        .get(`contest/${contestId}/qna`, { cache: 'no-store' })
        .json<MultipleQnaData[]>()

      const filtered = allqnaData
        .filter((qna) => qna.problemId === problemId)
        .sort((a, b) => a.order - b.order)

      if (!filtered.length) {
        setQnaDetails([])
        return
      }

      const details = await Promise.all(
        filtered.map(({ order }) =>
          fetcherWithAuth
            .get(`contest/${contestId}/qna/${order}`, { cache: 'no-store' })
            .json<SingleQnaData>()
        )
      )

      setQnaDetails(details)
    } catch (err) {
      console.error('API 호출 중 오류 발생:', err)
      setError('Something Wrong... Try Again!')
    } finally {
      setLoading(false)
    }
  }, [contestId, problemId])

  useEffect(() => {
    fetchQnaData()
  }, [fetchQnaData, refreshTrigger])

  if (loading) {
    return <div className="py-10 text-center">Loading...</div>
  }

  if (error) {
    return (
      <div className="mx-5 mb-[38px] mt-5 flex flex-col items-center justify-center gap-[10px] rounded-lg bg-[#121728] px-5 pb-10 pt-[30px] text-center font-sans text-[#787E80]">
        <FaCircleExclamation className="h-[30px] w-[30px]" />
        <p className="text-base">{error}</p>
        <Image src={'/logos/error.webp'} alt="error" width={150} height={150} />
      </div>
    )
  }

  if (!qnaDetails.length) {
    return (
      <div className="mx-5 mb-[38px] mt-5 flex flex-col items-center justify-center gap-[6px] rounded-lg bg-[#121728] px-5 pb-10 pt-[30px] text-center font-sans text-[#787E80]">
        <FaCircleExclamation className="h-[30px] w-[30px]" />
        <p className="text-base">Question not registered</p>
      </div>
    )
  }

  return <QnaAccordion qnaData={qnaDetails} />
}
