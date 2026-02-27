'use client'

import { DescriptionForm } from '@/app/admin/_components/DescriptionForm'
import { Button } from '@/components/shadcn/button'
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger
} from '@/components/shadcn/tooltip'
import { GET_ASSIGNMENT_SUBMISSION_SUMMARIES_OF_USER } from '@/graphql/assignment/queries'
import CheckboxIcon from '@/public/icons/check-box.svg'
import { useSuspenseQuery } from '@apollo/client'
import Image from 'next/image'
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

  return (
    <UpdateAssignmentProblemRecordForm onCompleted={() => setShowTooltip(true)}>
      <div className="min-w-[480px]">
        <div className="flex flex-col">
          <h2 className="text-title1_sb_20">Assessment</h2>
          <div className="mt-5 flex items-center justify-between">
            <div>
              <p className="text-body4_r_14">Final Score</p>
              <p className="text-body4_r_14 text-neutral-400">
                Max score: {score?.maxScore}, Auto graded score: {score?.score}
              </p>
            </div>
            <FinalScoreForm />
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <p className="text-body2_m_14">Comment</p>
            <DescriptionForm name="comment" isDarkmode={true} />
          </div>
          <div className="mt-5 flex self-end">
            <TooltipProvider>
              <Tooltip open={showTooltip}>
                <TooltipTrigger asChild>
                  <Button
                    className="text-body4_r_14 flex h-8 w-[88px] items-center gap-1 rounded-[4px] border border-blue-500 py-[7px] pl-[10px] pr-3"
                    type="submit"
                  >
                    <Image
                      src={CheckboxIcon}
                      alt="submit"
                      width={16}
                      height={16}
                    />
                    <span className="translate-y-[0.5px] leading-none">
                      Save
                    </span>
                  </Button>
                </TooltipTrigger>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </UpdateAssignmentProblemRecordForm>
  )
}
