import {
  getAssignment,
  getAssignmentProblemRecord
} from '@/app/(client)/_libs/apis/assignment'
import { AssignmentStatusTimeDiff } from '@/components/AssignmentStatusTimeDiff'
import { KatexContent } from '@/components/KatexContent'
import { Separator } from '@/components/shadcn/separator'
import { dateFormatter } from '@/libs/utils'
import calendarIcon from '@/public/icons/calendar.svg'
import Image from 'next/image'
import { TotalScoreLabel } from './_components/TotalScoreLabel'

interface AssignmentInfoProps {
  params: {
    assignmentId: string
  }
}

export default async function AssignmentInfo({ params }: AssignmentInfoProps) {
  const { assignmentId } = params

  const assignment = await getAssignment({ assignmentId })

  const record = await getAssignmentProblemRecord({ assignmentId })

  const formattedStartTime = dateFormatter(
    assignment.startTime,
    'MMM DD, YYYY HH:mm'
  )
  const formattedEndTime = dateFormatter(
    assignment.endTime,
    'MMM DD, YYYY HH:mm'
  )

  return (
    <div className="flex flex-col gap-10 px-[100px] py-[80px]">
      <div className="flex justify-between">
        <div className="flex flex-col gap-3">
          <p className="text-2xl font-semibold">
            <span className="text-primary">[Week {assignment.week}] </span>
            {assignment.title}
          </p>
          <TotalScoreLabel record={record} />
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
        content={assignment.description}
        classname="text-[#7F7F7F] font-normal text-base"
      />
    </div>
  )
}
