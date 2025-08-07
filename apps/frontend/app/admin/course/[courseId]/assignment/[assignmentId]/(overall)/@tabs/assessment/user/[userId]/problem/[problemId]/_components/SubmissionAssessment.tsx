'use client'

import { DescriptionForm } from '@/app/admin/_components/DescriptionForm'
import { Button } from '@/components/shadcn/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/shadcn/tooltip'
import { GET_ASSIGNMENT_SCORE_SUMMARIES } from '@/graphql/assignment/queries'
import { GET_ASSIGNMENT_PROBLEM_MAX_SCORE } from '@/graphql/problem/queries'
import submitIcon from '@/public/icons/submit.svg'
import { useSuspenseQuery } from '@apollo/client'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { FinalScoreForm } from './FinalScoreForm'
import { UpdateAssignmentProblemRecordForm } from './UpdateAssignmentProblemRecordForm'

interface SubmissionAssessmentProps {
  groupId: number
  assignmentId: number
  userId: number
  problemId: number
  autoGradedScore: number
}

export function SubmissionAssessment({
  groupId,
  assignmentId,
  userId,
  problemId,
  autoGradedScore
}: SubmissionAssessmentProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  const maxScore =
    useSuspenseQuery(GET_ASSIGNMENT_PROBLEM_MAX_SCORE, {
      variables: { groupId, assignmentId }
    }).data.getAssignmentProblems.find(
      (problem) => problem.problemId === problemId
    )?.score || 0

  const summaries = useSuspenseQuery(GET_ASSIGNMENT_SCORE_SUMMARIES, {
    variables: { groupId, assignmentId, take: 1000 }
  }).data.getAssignmentScoreSummaries

  const gradedCount = summaries.filter((summary) =>
    summary.problemScores.some(
      (score) => score.problemId === problemId && score.finalScore !== null
    )
  ).length

  const totalCount = summaries.length
  const nextStudent = summaries.find(
    (summary) =>
      !summary.problemScores.some(
        (score) => score.problemId === problemId && score.finalScore !== null
      )
  )

  return (
    <UpdateAssignmentProblemRecordForm
      groupId={groupId}
      assignmentId={assignmentId}
      userId={userId}
      problemId={problemId}
    >
      <div className="flex flex-col gap-6">
        <h2 className="text-xl font-bold">Assessment</h2>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">
            Final Score (Max score: {maxScore}, Auto graded score:{' '}
            {maxScore * autoGradedScore * 0.01})
          </p>
          <FinalScoreForm />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">Comment</p>
          <DescriptionForm name="comment" isDarkmode={true} />
        </div>
        <TooltipProvider>
          <Tooltip open={showTooltip}>
            <TooltipTrigger asChild>
              <Button
                className="my-4 mr-4 flex h-8 w-[75px] items-center self-end"
                type="submit"
                onClick={() => setShowTooltip(true)}
              >
                <Image src={submitIcon} alt="submit" width={24} height={24} />
                Save
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="flex gap-2">
                <span>
                  {gradedCount} of {totalCount} students graded.
                </span>
                {nextStudent && (
                  <Link
                    href={`/admin/course/${groupId}/assignment/${assignmentId}/assessment/user/${nextStudent.userId}/problem/${problemId}`}
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    Move to next student
                  </Link>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </UpdateAssignmentProblemRecordForm>
  )
}
