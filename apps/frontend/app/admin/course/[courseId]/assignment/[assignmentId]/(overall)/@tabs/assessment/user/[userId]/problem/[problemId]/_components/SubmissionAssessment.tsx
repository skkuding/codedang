'use client'

import { DescriptionForm } from '@/app/admin/_components/DescriptionForm'
import { Button } from '@/components/shadcn/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/shadcn/tooltip'
import {
  GET_ASSIGNMENT_SCORE_SUMMARIES,
  GET_ASSIGNMENT_SUBMISSION_SUMMARIES_OF_USER
} from '@/graphql/assignment/queries'
import submitIcon from '@/public/icons/submit.svg'
import { useSuspenseQuery } from '@apollo/client'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { FinalScoreForm } from './FinalScoreForm'
import { UpdateAssignmentProblemRecordForm } from './UpdateAssignmentProblemRecordForm'

export function SubmissionAssessment() {
  const params = useParams<{
    courseId: string
    assignmentId: string
    userId: string
    problemId: string
  }>()
  const { courseId, assignmentId, userId, problemId } = params
  const [showTooltip, setShowTooltip] = useState(false)

  const score = useSuspenseQuery(GET_ASSIGNMENT_SUBMISSION_SUMMARIES_OF_USER, {
    variables: {
      groupId: Number(courseId),
      assignmentId: Number(assignmentId),
      userId: Number(userId),
      take: 1000
    }
  }).data?.getAssignmentSubmissionSummaryByUserId.scoreSummary.scoreSummaryByProblem.find(
    (score) => score.problemId === Number(problemId)
  )

  const summaries = useSuspenseQuery(GET_ASSIGNMENT_SCORE_SUMMARIES, {
    variables: {
      groupId: Number(courseId),
      assignmentId: Number(assignmentId),
      take: 1000
    }
  }).data.getAssignmentScoreSummaries

  const gradedCount = summaries.filter((summary) =>
    summary.scoreSummaryByProblem.some(
      (score) =>
        score.problemId === Number(problemId) && score.finalScore !== null
    )
  ).length
  const totalCount = summaries.length
  const nextStudent = summaries.find(
    (summary) =>
      !summary.scoreSummaryByProblem.some(
        (score) =>
          score.problemId === Number(problemId) && score.finalScore !== null
      )
  )

  return (
    <UpdateAssignmentProblemRecordForm onCompleted={() => setShowTooltip(true)}>
      <div className="flex flex-col gap-6">
        <h2 className="text-xl font-bold">Assessment</h2>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">
            Final Score (Max score: {score?.maxScore}, Auto graded score:{' '}
            {score?.score})
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
                variant="editor"
                size="editor"
                className="bg-primary self-end"
                type="submit"
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
                    href={`/admin/course/${courseId}/assignment/${assignmentId}/assessment/user/${nextStudent.userId}/problem/${problemId}`}
                    className="text-color-blue-40 hover:text-color-blue-30 underline"
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
