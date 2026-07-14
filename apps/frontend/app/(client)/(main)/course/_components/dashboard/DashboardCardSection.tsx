import { ScrollArea } from '@/components/shadcn/scroll-area'
import { ErrorBoundary, Suspense } from '@suspensive/react'
import {
  DashboardCourseAssignmentList,
  DashboardCourseAssignmentListView
} from './DashboardCourseAssignmentList'
import type { CourseAssignmentList } from './types'

interface DashboardCardSectionProps {
  courseAssignmentLists: CourseAssignmentList[]
  isExercise?: boolean
}

export function DashboardCardSection({
  courseAssignmentLists,
  isExercise = false
}: DashboardCardSectionProps) {
  const title = isExercise ? 'Exercise' : 'Assignment'

  return (
    <section className="flex h-full rounded-[12px] bg-white shadow-[0_4px_20px_rgba(53,78,116,0.10)]">
      <div className="flex w-full max-w-[100vw] flex-col overflow-hidden py-[30px] pl-6 pr-2 md:max-w-[390px]">
        <span className="mb-6 text-[24px] font-semibold leading-[33.6px] tracking-[-0.72px]">
          {title}
        </span>

        <ScrollArea className="flex-1 pr-4 [&>div>div]:!flex [&>div>div]:!flex-col">
          {courseAssignmentLists.map((courseAssignmentList, index) => {
            const assignmentListWithoutSummary = (
              <DashboardCourseAssignmentListView
                courseAssignmentList={courseAssignmentList}
              />
            )

            return (
              <div key={courseAssignmentList.courseId} className="w-full">
                <ErrorBoundary
                  fallback={assignmentListWithoutSummary}
                  resetKeys={[courseAssignmentList.courseId, isExercise]}
                >
                  <Suspense fallback={assignmentListWithoutSummary}>
                    <DashboardCourseAssignmentList
                      courseAssignmentList={courseAssignmentList}
                      isExercise={isExercise}
                    />
                  </Suspense>
                </ErrorBoundary>

                {index < courseAssignmentLists.length - 1 && (
                  <hr className="my-6 border-t-[0.5px] border-neutral-100" />
                )}
              </div>
            )
          })}
        </ScrollArea>
      </div>
    </section>
  )
}
