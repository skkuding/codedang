import { AssignmentStatusTimeDiff } from '@/components/AssignmentStatusTimeDiff'
import { KatexContent } from '@/components/KatexContent'
import { Separator } from '@/components/shadcn/separator'
import { dateFormatter, safeFetcherWithAuth } from '@/libs/utils'
import calendarIcon from '@/public/icons/calendar.svg'
import type { Assignment } from '@/types/type'
import Image from 'next/image'
import { TotalScoreLabel } from '../_components/TotalScoreLabel'

interface AssignmentInfoProps {
  params: {
    courseId: string
    assignmentId: string
  }
}
export type GetAssignmentRecordResponse = {
  submittedProblemCount: number
  totalProblemCount: number
  userAssignmentScore: number
  assignmentPerfectScore: number
  userAssignmentFinalScore: number | null
  problemScores: ProblemScore[] | null
}
interface ProblemScore {
  problemId: number
  score: number | null
  maxScore: number
  finalScore: number | null
}

export default async function AssignmentInfo({ params }: AssignmentInfoProps) {
  const { assignmentId, courseId } = params

  const res = await safeFetcherWithAuth.get(`assignment/${assignmentId}`)

  const assignment: Assignment = await res.json()

  const formattedStartTime = dateFormatter(
    assignment.startTime,
    'YYYY-MM-DD HH:mm:ss'
  )
  const formattedEndTime = dateFormatter(
    assignment.endTime,
    'YYYY-MM-DD HH:mm:ss'
  )

  const description = assignment.description

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-3">
          <p className="text-2xl font-semibold">
            <span className="text-primary">[Week {assignment.week}] </span>
            {assignment.title}
          </p>
          <TotalScoreLabel assignmentId={assignmentId} courseId={courseId} />
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Image src={calendarIcon} alt="calendar" width={16} height={16} />
            <p className="text-sm font-medium text-[#333333e6]">
              {formattedStartTime} ~ {formattedEndTime}
            </p>
          </div>
          <AssignmentStatusTimeDiff
            assignment={assignment}
            textStyle="text-[#333333e6] font-medium opacity-100 text-sm"
            inAssignmentEditor={false}
          />
        </div>
      </div>
      <Separator className="my-3" />
      <div className="text-2xl font-semibold">Assignment Description</div>
      <KatexContent
        content={description}
        classname="text-[#7F7F7F] font-normal text-base"
      />
    </div>
  )
}
