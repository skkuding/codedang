'use client'

import { useQnaCommentsSync } from '@/app/(client)/(code-editor)/_components/context/RefetchingQnaCommentsStoreProvider'
import { fetcherWithAuth } from '@/libs/utils'
import type { CourseQnAItem } from '@/types/type'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { FaCircleExclamation } from 'react-icons/fa6'
import { QnaAccordion } from './QnaAccordion'

interface QuestionAnswerAreaProps {
  courseId: number
  problemId: number
  assignmentId?: number
  exerciseId?: number
  isExercise?: boolean
}

export function QuestionAnswerArea({
  courseId,
  problemId,
  assignmentId,
  exerciseId,
  isExercise = false
}: QuestionAnswerAreaProps) {
  const [loading, setLoading] = useState(true)
  const [qnaDetails, setQnaDetails] = useState<CourseQnAItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const refreshTrigger = useQnaCommentsSync((s) => s.refreshTrigger)

  const fetchQnaData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const allqnaData = await fetcherWithAuth
        .get(`course/${courseId}/qna?problemId=${problemId}`, {
          cache: 'no-store'
        })
        .json<CourseQnAItem[]>()

      if (!allqnaData.length) {
        setQnaDetails([])
        return
      }

      const filteredQnaData = allqnaData.filter((item) => {
        if (item.problemId !== problemId) {
          return false
        }

        const targetAssignmentId = isExercise ? exerciseId : assignmentId
        const shouldFilterByContext = targetAssignmentId !== undefined

        if (!shouldFilterByContext) {
          return true
        }

        return (
          item.assignmentId === targetAssignmentId &&
          item.isExercise === isExercise
        )
      })

      const details = await Promise.all(
        filteredQnaData.map(({ order }) =>
          fetcherWithAuth
            .get(`course/${courseId}/qna/${order}`, { cache: 'no-store' })
            .json<CourseQnAItem>()
        )
      )

      setQnaDetails(details)
    } catch (err) {
      console.error('API 호출 중 오류 발생:', err)
      setError('Something Wrong... Try Again!')
    } finally {
      setLoading(false)
    }
  }, [assignmentId, courseId, exerciseId, isExercise, problemId])

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
