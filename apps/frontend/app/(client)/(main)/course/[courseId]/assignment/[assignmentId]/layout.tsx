import { AssignmentStatusTimeDiff } from '@/components/AssignmentStatusTimeDiff'
import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { dateFormatter, safeFetcherWithAuth } from '@/libs/utils'
import calendarIcon from '@/public/icons/calendar.svg'
import type { Assignment } from '@/types/type'
import { ErrorBoundary } from '@suspensive/react'
import Image from 'next/image'
import { AssignmentTabs } from './_components/AssignmentTabs'

interface AssignmentDetailProps {
  params: {
    assignmentId: string
    courseId: string
  }
  tabs: React.ReactNode
}

export default async function Layout({ params, tabs }: AssignmentDetailProps) {
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

  return (
    <article className="flex flex-col gap-12 p-8">
      <div className="mt-[30px] flex flex-col items-end gap-[10px]">
        <div className="flex w-full justify-between">
          <div className="flex flex-col gap-3">
            <p className="font-bold">
              <span className="text-primary">[Week {assignment.week}] </span>
              {assignment.title}
            </p>
            {/* TODO: fetch score */}
            <p className="font-semibold">
              <span className="text-primary-light">Total score</span>{' '}
              <span className="text-primary text-sm">100/100</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="flex gap-2">
              <Image src={calendarIcon} alt="calendar" width={20} height={20} />
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
      </div>
      <AssignmentTabs assignmentId={assignmentId} courseId={courseId} />
      <ErrorBoundary fallback={FetchErrorFallback}>{tabs}</ErrorBoundary>
    </article>
  )
}
