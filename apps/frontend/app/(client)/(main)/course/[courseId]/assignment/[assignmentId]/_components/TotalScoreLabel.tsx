'use client'

import { fetcherWithAuth } from '@/libs/utils'
import type { AssignmentGrade } from '@/types/type'
import { useEffect, useState } from 'react'

interface TotalScoreLabelProps {
  assignmentId: string
  courseId: string
}

export function TotalScoreLabel({
  assignmentId,
  courseId
}: TotalScoreLabelProps) {
  const [myScoreSummary, setMyScoreSummary] = useState<AssignmentGrade | null>(
    null
  )
  useEffect(() => {
    async function getMyScoreSummary() {
      const myScoreSummary = await fetcherWithAuth<AssignmentGrade>(
        `assignment/${assignmentId}/score/me`
      ).json()
      setMyScoreSummary(myScoreSummary)
    }
    getMyScoreSummary()
  }, [assignmentId, courseId, setMyScoreSummary])

  return myScoreSummary ? (
    <div className="text-primary flex gap-2">
      <div className="border-primary flex h-[31px] w-[125px] items-center justify-center rounded-full border text-lg">
        Total score
      </div>
      <span className="text-xl font-semibold">
        {myScoreSummary?.userAssignmentJudgeScore}/
        {myScoreSummary?.assignmentPerfectScore}
      </span>
    </div>
  ) : null
}
