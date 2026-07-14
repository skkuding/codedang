import { assignmentQueries } from '@/app/(client)/_libs/queries/assignment'
import type { AssignmentSummary } from '@/types/type'
import { useSuspenseQuery } from '@tanstack/react-query'
import { AssignmentLink } from '../../[courseId]/_components/AssignmentLink'
import type { GroupedRows } from './types'

interface DashboardCourseGroupProps {
  group: GroupedRows
  isExercise: boolean
}

interface DashboardCourseGroupViewProps {
  group: GroupedRows
  summaries?: AssignmentSummary[]
}

function DashboardCourseGroup({
  group,
  isExercise
}: DashboardCourseGroupProps) {
  const { data: summaries } = useSuspenseQuery({
    ...assignmentQueries.grades({
      courseId: group.courseId,
      isExercise
    }),
    staleTime: 30_000
  })

  return <DashboardCourseGroupView group={group} summaries={summaries} />
}

function DashboardCourseGroupView({
  group,
  summaries
}: DashboardCourseGroupViewProps) {
  const summaryByAssignmentId = new Map(
    summaries?.map((summary) => [summary.id, summary])
  )

  return (
    <>
      <p className="mb-3 pl-[6px] text-[14px] font-semibold leading-[19.6px] tracking-[-0.42px] text-black">
        <span className="bg-primary-light mr-2 inline-block h-[22px] w-[6px] rounded-[1px] align-middle" />
        {group.courseTitle}
      </p>

      <div className="flex flex-col gap-2">
        {group.rows.map((row) => {
          const summary = summaryByAssignmentId.get(row.id)

          return (
            <div
              key={row.id}
              className="group relative w-full overflow-hidden rounded-md bg-neutral-100 transition hover:bg-neutral-200"
            >
              <div className="relative flex items-center py-[10px]">
                <div className="flex min-w-0 flex-1 items-center">
                  <div className="pl-[18px] pr-[10px]">
                    <span className="bg-primary inline-block h-2 w-2 shrink-0 rounded-full" />
                  </div>

                  <div className="min-w-0">
                    <AssignmentLink
                      assignment={row}
                      courseId={group.courseId}
                      isExercise={row.isExercise}
                    />
                  </div>
                </div>

                <span className="text-primary ml-3 w-[70px] shrink-0 whitespace-nowrap pr-[18px] text-right text-sm font-medium tabular-nums">
                  {summary?.submittedCount ?? '-'}/
                  {summary?.problemCount ?? row.problemCount}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

export { DashboardCourseGroup, DashboardCourseGroupView }
