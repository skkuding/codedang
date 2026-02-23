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
import { useTranslate } from '@tolgee/react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { FinalScoreForm } from './FinalScoreForm'
import { UpdateAssignmentProblemRecordForm } from './UpdateAssignmentProblemRecordForm'

export function SubmissionAssessment() {
  const { t } = useTranslate()
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
        <h2 className="text-xl font-bold">{t('assessment_heading')}</h2>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">
            {t('final_score_heading', {
              maxScore: score?.maxScore,
              gradedScore: score?.score
            })}
          </p>
          <FinalScoreForm />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">{t('comment_heading')}</p>
          <DescriptionForm name="comment" isDarkmode={true} />
        </div>
        <TooltipProvider>
          <Tooltip open={showTooltip}>
            <TooltipTrigger asChild>
              <Button
                className="my-4 mr-4 flex h-8 w-[75px] items-center self-end"
                type="submit"
              >
                <Image src={submitIcon} alt="submit" width={24} height={24} />
                {t('save_button')}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="flex gap-2">
                <span>
                  {t('students_graded', {
                    graded: gradedCount,
                    total: totalCount
                  })}
                </span>
                {nextStudent && (
                  <Link
                    href={`/admin/course/${courseId}/assignment/${assignmentId}/assessment/user/${nextStudent.userId}/problem/${problemId}`}
                    className="text-color-blue-40 hover:text-color-blue-30 underline"
                  >
                    {t('move_to_next_student')}
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
