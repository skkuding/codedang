'use client'

import { DescriptionForm } from '@/app/admin/_components/DescriptionForm'
import { Button } from '@/components/shadcn/button'
import submitIcon from '@/public/icons/submit.svg'
import Image from 'next/image'
import { FinalScoreForm } from './FinalScoreForm'
import { UpdateAssignmentProblemRecordForm } from './UpdateAssignmentProblemRecordForm'

interface SubmissionAssessmentProps {
  groupId: number
  assignmentId: number
  userId: number
  problemId: number
}

export function SubmissionAssessment({
  groupId,
  assignmentId,
  userId,
  problemId
}: SubmissionAssessmentProps) {
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
          <p className="text-sm font-semibold">Final Score (Max score: 10)</p>
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
