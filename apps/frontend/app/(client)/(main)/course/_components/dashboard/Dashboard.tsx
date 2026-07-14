'use client'

import { assignmentQueries } from '@/app/(client)/_libs/queries/assignment'
import { fetcherWithAuth } from '@/libs/utils'
import type { Assignment, JoinedCourse } from '@/types/type'
import { useQueries, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { DashboardCalendar } from './DashboardCalendar'
import { DashboardCardSection } from './DashboardCardSection'
import type { GroupedRows, WorkItem } from './types'
import {
  isActiveOnDate,
  isNotExpired,
  isSameDay,
  startOfDay,
  todayAtMidnight
} from './utils'

const toGroupInfo = (group: Assignment['group'] | undefined) => ({
  id: Number.isFinite(Number(group?.id)) ? Number(group?.id) : 0,
  groupName: group?.groupName ?? 'Unknown'
})

export function Dashboard() {
  const { data: courses = [] } = useQuery({
    queryKey: ['joinedCourses'],
    queryFn: async () => {
      return await fetcherWithAuth.get('course/joined').json<JoinedCourse[]>()
    }
  })

  const validCourseIds = useMemo(
    () => courses.map((c) => c.id).filter((n) => Number.isFinite(n) && n > 0),
    [courses]
  )

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    todayAtMidnight()
  )
  const [viewMonth, setViewMonth] = useState<Date>(() => {
    const base = selectedDate ?? todayAtMidnight()
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })

  const onSelectDate = (nextDate: Date | undefined) => {
    const today = todayAtMidnight()
    if (!nextDate) {
      setSelectedDate(today)
      setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1))
      return
    }
    const normalized = startOfDay(nextDate)
    if (selectedDate && isSameDay(selectedDate, normalized)) {
      setSelectedDate(today)
      setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1))
    } else {
      setSelectedDate(normalized)
      setViewMonth(new Date(normalized.getFullYear(), normalized.getMonth(), 1))
    }
  }

  const assignmentQueriesResult = useQueries({
    queries: validCourseIds.map((courseId) => ({
      ...assignmentQueries.multiple({ courseId }),
      staleTime: 30_000
    }))
  })

  const allAssignments = useMemo<Assignment[]>(
    () => assignmentQueriesResult.flatMap((q) => q.data ?? []),
    [assignmentQueriesResult]
  )

  const assignments = useMemo(
    () => allAssignments.filter((assignment) => !assignment.isExercise),
    [allAssignments]
  )

  const exercises = useMemo<Assignment[]>(
    () => allAssignments.filter((assignment) => assignment.isExercise),
    [allAssignments]
  )

  const allRows = useMemo<WorkItem[]>(() => {
    const toRows = (list: Assignment[] | undefined, isExercise: boolean) =>
      (list ?? []).flatMap((a) => {
        const startTime = new Date(a.startTime)
        const endTime = new Date(a.endTime)
        const dueTime = new Date(a.dueTime ?? a.endTime)
        if (
          [startTime, endTime, dueTime].some((d) => Number.isNaN(d.getTime()))
        ) {
          return []
        }
        return [
          {
            id: a.id,
            title: a.title,
            isExercise,
            startTime,
            endTime,
            dueTime,
            group: toGroupInfo(a.group),
            problemCount: a.problemCount ?? 0,
            week: a.week,
            status: a.status,
            raw: a
          } satisfies WorkItem
        ]
      })
    return [...toRows(assignments, false), ...toRows(exercises, true)]
  }, [assignments, exercises])

  const visibleRows = useMemo(
    () =>
      allRows.filter(
        (workItem) =>
          isNotExpired(workItem) && isActiveOnDate(selectedDate, workItem)
      ),
    [allRows, selectedDate]
  )

  const groupedByCourse: GroupedRows[] = useMemo(() => {
    const map = new Map<number, WorkItem[]>()
    for (const row of visibleRows) {
      const key = row.group.id || 0
      let bucket = map.get(key)
      if (!bucket) {
        bucket = []
        map.set(key, bucket)
      }
      bucket.push(row)
    }
    return [...map]
      .map(([courseId, rows]) => {
        const detail = courses.find((c) => c.id === courseId)

        return {
          courseId,
          courseNum: detail?.courseInfo.courseNum,
          classNum: detail?.courseInfo.classNum,
          courseTitle: rows[0].group.groupName || 'Unknown',
          rows
        }
      })
      .sort((a, b) => a.courseTitle.localeCompare(b.courseTitle))
  }, [visibleRows, courses])

  const deadlineDateList = useMemo(() => {
    const uniq = new Set<number>()
    for (const row of allRows.filter(isNotExpired)) {
      const t = startOfDay(new Date(row.dueTime ?? row.endTime)).getTime()
      uniq.add(t)
    }
    return [...uniq].map((t) => new Date(t))
  }, [allRows])
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
            groups={groupedByCourse.map((group) => ({
              ...group,
              rows: group.rows.filter((r) => !r.isExercise)
            }))}
            selectedDate={selectedDate}
          />
        </div>

        <div className="order-3 flex max-h-[460px] flex-col md:order-2">
          <DashboardCardSection
            title="Exercise"
            isExercise
            groups={groupedByCourse.map((group) => ({
              ...group,
              rows: group.rows.filter((r) => r.isExercise)
            }))}
            selectedDate={selectedDate}
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
