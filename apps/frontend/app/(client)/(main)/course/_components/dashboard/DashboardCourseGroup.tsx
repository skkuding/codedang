import { assignmentQueries } from '@/app/(client)/_libs/queries/assignment'
import type { Assignment, AssignmentSummary } from '@/types/type'
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

interface DashboardAssignmentRowProps {
  assignment: Assignment
  courseId: number
  summary?: AssignmentSummary
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
        {group.rows.map((assignment) => (
          <DashboardAssignmentRow
            key={assignment.id}
            assignment={assignment}
            courseId={group.courseId}
            summary={summaryByAssignmentId.get(assignment.id)}
          />
        ))}
      </div>
    </>
  )
}

function DashboardAssignmentRow({
  assignment,
  courseId,
  summary
}: DashboardAssignmentRowProps) {
  return (
    <div className="group relative w-full overflow-hidden rounded-md bg-neutral-100 transition hover:bg-neutral-200">
      <div className="relative flex items-center py-[10px]">
        <div className="flex min-w-0 flex-1 items-center">
          <div className="pl-[18px] pr-[10px]">
            <span className="bg-primary inline-block h-2 w-2 shrink-0 rounded-full" />
          </div>

          <div className="min-w-0">
            <AssignmentLink
              assignment={assignment}
              courseId={courseId}
              isExercise={assignment.isExercise}
            />
          </div>
        </div>

        <span className="text-primary ml-3 w-[70px] shrink-0 whitespace-nowrap pr-[18px] text-right text-sm font-medium tabular-nums">
          {summary?.submittedCount ?? '-'}/
          {summary?.problemCount ?? assignment.problemCount}
        </span>
      </div>
    </div>
  )
}

export { DashboardCourseGroup, DashboardCourseGroupView }
