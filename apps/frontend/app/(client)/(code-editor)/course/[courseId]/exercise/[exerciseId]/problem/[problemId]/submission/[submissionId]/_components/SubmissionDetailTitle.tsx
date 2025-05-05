'use client'

import { convertToLetter, safeFetcherWithAuth } from '@/libs/utils'
import type { Language } from '@/types/type'
import { useSuspenseQuery } from '@tanstack/react-query'

interface SubmissionItem {
  id: number
  user: {
    username: string
  }
  createTime: string
  language: Language
  result: string
  codeSize: number
}

interface AssignmentProblem {
  order: number
  problem: {
    id: number
    title: string
  }
  assignment: {
    id: number
    isJudgeResultVisible: boolean
    title: string
  }
}

interface AssignmentSubmission {
  data: SubmissionItem[]
  total: number
  assignmentProblem: AssignmentProblem
}

interface SubmissionDetailTitleProps {
  problemId: number
  exerciseId: number
}

export function SubmissionDetailTitle({
  problemId,
  exerciseId
}: SubmissionDetailTitleProps) {
  async function fetchAssignmentSubmissionTitleWithOrder(exerciseId: number) {
    const res: AssignmentSubmission = await safeFetcherWithAuth(
      `assignment/${exerciseId}/submission`,
      {
        searchParams: { problemId, take: 100 }
      }
    ).json()

    const problemTitle = res.assignmentProblem.problem.title
    const problemOrder = res.assignmentProblem.order
    const detailTitle = `${convertToLetter(problemOrder)}. ${problemTitle}`
    return detailTitle
  }

  const { data: detailTitle } = useSuspenseQuery({
    queryKey: ['assignment submission problem title with order', exerciseId],
    queryFn: () => fetchAssignmentSubmissionTitleWithOrder(exerciseId)
  })

  return (
    <div>
      <h1 className="text-xl font-bold">{detailTitle}</h1>
    </div>
  )
}
