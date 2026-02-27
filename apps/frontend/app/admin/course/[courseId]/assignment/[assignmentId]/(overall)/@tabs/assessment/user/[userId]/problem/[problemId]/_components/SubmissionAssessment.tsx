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
import CheckboxIcon from '@/public/icons/check-box.svg'
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
      <div className="min-w-[480px]">
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold leading-[28px] tracking-[-0.6px]">
            {t('assessment_heading')}
          </h2>
          <div className="mt-5 flex items-center justify-between">
            <div>
              <p className="text-[14px] font-normal">
                {t('final_score_heading')}
              </p>
              <p className="text-sm text-neutral-400">
                {t('max_and_auto_graded_score', {
                  maxScore: score?.maxScore,
                  gradedScore: score?.score
                })}
              </p>
            </div>
            <FinalScoreForm />
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <p className="text-[14px] font-medium">{t('comment_heading')}</p>
            <DescriptionForm name="comment" isDarkmode={true} />
          </div>
          <div className="mt-5 flex self-end">
            <TooltipProvider>
              <Tooltip open={showTooltip}>
                <TooltipTrigger asChild>
                  <Button
                    className="flex h-8 w-[88px] items-center gap-1 rounded-[4px] border border-blue-500 py-[7px] pl-[10px] pr-3 text-sm font-normal"
                    type="submit"
                  >
                    <Image
                      src={CheckboxIcon}
                      alt={t('save_button')}
                      width={16}
                      height={16}
                    />
                    <span className="translate-y-[0.5px] leading-none">
                      {t('save_button')}
                    </span>
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
        </div>
      </div>
    </UpdateAssignmentProblemRecordForm>
  )
}
