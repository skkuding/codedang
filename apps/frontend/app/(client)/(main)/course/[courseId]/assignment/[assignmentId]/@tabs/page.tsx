import { AssignmentStatusTimeDiff } from '@/components/AssignmentStatusTimeDiff'
import { KatexContent } from '@/components/KatexContent'
import { Separator } from '@/components/shadcn/separator'
import { dateFormatter, safeFetcherWithAuth } from '@/libs/utils'
import calendarIcon from '@/public/icons/calendar.svg'
import type { Assignment } from '@/types/type'
import Image from 'next/image'

interface AssignmentInfoProps {
  params: {
    courseId: string
    assignmentId: string
  }
}

export default async function AssginmentInfo({ params }: AssignmentInfoProps) {
  const { assignmentId } = params

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
          {/* TODO: fetch score */}
          <div className="text-primary flex gap-2">
            <div className="border-primary flex h-[31px] w-[125px] items-center justify-center rounded-full border text-lg">
              Total score
            </div>
            <span className="text-xl font-semibold">100/100</span>
          </div>
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
