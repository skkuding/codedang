'use client'

import { useMemo } from 'react'
import { DashboardCalendar } from './DashboardCalendar'
import { DashboardCardSection } from './DashboardCardSection'
import { createDashboardViewModel } from './selectors'
import { useDashboardAssignments } from './useDashboardAssignments'
import { useDashboardCalendar } from './useDashboardCalendar'

export function Dashboard() {
  const assignments = useDashboardAssignments()
  const { onSelectDate, selectedDate, setViewMonth, viewMonth } =
    useDashboardCalendar()
  const { assignmentCourseSections, deadlineDateList, exerciseCourseSections } =
    useMemo(
      () => createDashboardViewModel({ assignments, selectedDate }),
      [assignments, selectedDate]
    )

  return (
    <section className="mx-auto max-w-[1208px]">
      <div className="pb-4 sm:pb-[30px]">
        <h2 className="text-head5_sb_24 md:text-head3_sb_28">나의 대시보드</h2>
      </div>

      <div className="grid grid-cols-1 gap-[14px] md:grid md:grid-cols-2 lg:grid-cols-3">
        <div className="order-2 flex max-h-[460px] flex-col md:order-1">
          <DashboardCardSection
            title="Assignment"
            isExercise={false}
            courseSections={assignmentCourseSections}
          />
        </div>

        <div className="order-3 flex max-h-[460px] flex-col md:order-2">
          <DashboardCardSection
            title="Exercise"
            isExercise
            courseSections={exerciseCourseSections}
          />
        </div>
        <div className="order-1 flex flex-col md:order-3">
          <DashboardCalendar
            selectedDate={selectedDate}
            onSelect={onSelectDate}
            deadlineDateList={deadlineDateList}
            viewMonth={viewMonth}
            setViewMonth={setViewMonth}
          />
        </div>
      </div>
    </section>
  )
}
