'use client'

import { DescriptionForm } from '@/app/admin/_components/DescriptionForm'
import { Button } from '@/components/shadcn/button'
import { GET_ASSIGNMENT_PROBLEM_MAX_SCORE } from '@/graphql/problem/queries'
import submitIcon from '@/public/icons/submit.svg'
import { useSuspenseQuery } from '@apollo/client'
import Image from 'next/image'
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
  const maxScore =
    useSuspenseQuery(GET_ASSIGNMENT_PROBLEM_MAX_SCORE, {
      variables: { groupId, assignmentId }
    }).data.getAssignmentProblems.find(
      (problem) => problem.problemId === problemId
    )?.score || 0

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
        <Button
          className="my-4 mr-4 flex h-8 w-[75px] items-center self-end"
          type="submit"
        >
          <Image src={submitIcon} alt="submit" width={24} height={24} />
          Save
        </Button>
      </div>
    </UpdateAssignmentProblemRecordForm>
  )
}
