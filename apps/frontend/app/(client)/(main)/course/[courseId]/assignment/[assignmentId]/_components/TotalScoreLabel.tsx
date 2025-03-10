'use client'

import { fetcherWithAuth } from '@/libs/utils'
import { useEffect, useState } from 'react'

interface TotalScoreLabelProps {
  assignmentId: string
  courseId: string
}

interface ScoreSummary {
  submittedProblemCount: number
  totalProblemCount: number
  userAssignmentScore: number
  assignmentPerfectScore: number
  userAssignmentFinalScore: number
}
export function TotalScoreLabel({
  assignmentId,
  courseId
}: TotalScoreLabelProps) {
  const [myScoreSummary, setMyScoreSummary] = useState<ScoreSummary | null>(
    null
  )
  useEffect(() => {
    async function getMyScoreSummary() {
      const myScoreSummary = await fetcherWithAuth<ScoreSummary>(
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
        {myScoreSummary?.userAssignmentScore}/
        {myScoreSummary?.assignmentPerfectScore}
      </span>
    </div>
  ) : null
}
