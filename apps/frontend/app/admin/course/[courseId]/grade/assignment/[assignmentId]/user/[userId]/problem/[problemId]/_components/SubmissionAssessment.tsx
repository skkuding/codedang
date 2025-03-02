import { TextEditor } from '@/components/TextEditor'
import { Button } from '@/components/shadcn/button'
import { Input } from '@/components/shadcn/input'
import { GET_ASSIGNMENT_PROBLEM_RECORD } from '@/graphql/assignment/queries'
import submitIcon from '@/public/icons/submit.svg'
import { useSuspenseQuery } from '@apollo/client'
import Image from 'next/image'

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
  const grade = useSuspenseQuery(GET_ASSIGNMENT_PROBLEM_RECORD, {
    variables: {
      groupId,
      assignmentId,
      userId,
      problemId
    }
  }).data?.getAssignmentProblemRecord

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold">Assessment</h2>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold">Final Score (Max score: 10)</p>
        <Input
          className="hide-spin-button h-9 w-20 rounded-md border border-[#3F444F] bg-[#29303F] focus-visible:ring-1 focus-visible:ring-white"
          type="number"
        />
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold">Comment</p>
        <TextEditor
          onChange={() => {}}
          placeholder="Enter a comment..."
          defaultValue={grade.comment}
          isDarkMode={true}
        />
      </div>
      <Button className="my-4 mr-4 flex h-8 w-[75px] items-center self-end">
        <Image src={submitIcon} alt="submit" width={24} height={24} />
        Save
      </Button>
    </div>
  )
}
