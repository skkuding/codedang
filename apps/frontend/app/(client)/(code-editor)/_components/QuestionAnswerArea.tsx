'use client'

import { useQnaCommentsSync } from '@/app/(client)/(code-editor)/_components/context/RefetchingQnaCommentsStoreProvider'
import { useSession } from '@/libs/hooks/useSession'
import { fetcherWithAuth } from '@/libs/utils'
import { cn } from '@/libs/utils'
import type { MultipleQnaData, SingleQnaData } from '@/types/type'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { FaCircleExclamation } from 'react-icons/fa6'
import { QnaAccordion } from './QnaAccordion'

interface QuestionAnswerAreaProps {
  problemId: number
  contestId?: number
  courseId?: number
  assignmentId?: number
  exerciseId?: number
  isExercise?: boolean
}

export function QuestionAnswerArea({
  problemId,
  contestId,
  courseId
}: QuestionAnswerAreaProps) {
  const session = useSession()
  const currentUsername = session?.user?.username
  const [loading, setLoading] = useState(true)
  const [qnaDetails, setQnaDetails] = useState<SingleQnaData[]>([])
  const [error, setError] = useState<string | null>(null)
  const [questionFilter, setQuestionFilter] = useState<'all' | 'mine'>('all')
  const refreshTrigger = useQnaCommentsSync((s) => s.refreshTrigger)
  const isCourseQna = contestId === undefined && courseId !== undefined

  const fetchQnaData = useCallback(async () => {
    setLoading(true)
    setError(null)
    const isContest = contestId !== undefined
    const listApiUrl = isContest
      ? `contest/${contestId}/qna`
      : `course/${courseId}/qna`

    const getDetailApiUrl = (order: number) => {
      if (isContest) {
        return `contest/${contestId}/qna/${order}`
      }

      return `course/${courseId}/qna/${order}`
    }

    try {
      const qnaResponse = await fetcherWithAuth
        .get(listApiUrl, {
          cache: 'no-store'
        })
        .json<MultipleQnaData[]>()

      const allqnaData = Array.isArray(qnaResponse) ? qnaResponse : []

      const filteredQnaData = allqnaData.filter((item) => {
        if (item.problemId !== problemId) {
          return false
        }

        if (isContest) {
          return true
        }

        // Backend maps course QnA to the latest assignment containing the problem.
        // To avoid hiding newly created QnA in exercise/assignment pages,
        // filter by problem only on course pages.
        return true
      })

      if (filteredQnaData.length === 0) {
        setQnaDetails([])
        return
      }

      const details = await Promise.all(
        filteredQnaData.map(({ order }) =>
          fetcherWithAuth
            .get(getDetailApiUrl(order), { cache: 'no-store' })
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
  }, [contestId, courseId, problemId])

  useEffect(() => {
    fetchQnaData()
  }, [fetchQnaData, refreshTrigger])

  const filteredQnaDetails =
    questionFilter === 'mine'
      ? qnaDetails.filter((qna) => qna.createdBy?.username === currentUsername)
      : qnaDetails

  const qnaFilterHeader = isCourseQna ? (
    <div className="mb-1 flex items-center justify-between px-5 py-5">
      <div className="flex items-center gap-[18px]">
        <button
          type="button"
          onClick={() => setQuestionFilter('all')}
          className={cn(
            'text-head6_m_24 border-b-2 pb-0.5 transition-colors',
            questionFilter === 'all'
              ? 'border-primary text-primary'
              : 'border-transparent text-white'
          )}
        >
          All Questions
        </button>
        <button
          type="button"
          onClick={() => setQuestionFilter('mine')}
          className={cn(
            'text-head6_m_24 border-b-2 pb-0.5 transition-colors',
            questionFilter === 'mine'
              ? 'border-primary text-primary'
              : 'border-transparent text-white'
          )}
        >
          My Questions
        </button>
      </div>

      <Link
        href={`/course/${courseId}/qna`}
        className="text-body2_m_14 text-color-cool-neutral-50 transition-colors hover:text-white"
      >
        See more questions &gt;
      </Link>
    </div>
  ) : null

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

  if (!filteredQnaDetails.length) {
    return (
      <div className="flex h-full flex-col">
        {qnaFilterHeader}

        <div className="mx-5 mb-[38px] mt-5 flex flex-col items-center justify-center gap-[6px] rounded-lg bg-[#121728] px-5 pb-10 pt-[30px] text-center font-sans text-[#787E80]">
          <FaCircleExclamation className="h-[30px] w-[30px]" />
          <p className="text-base">Question not registered</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {qnaFilterHeader}

      <QnaAccordion key={questionFilter} qnaData={filteredQnaDetails} />
    </div>
  )
}
