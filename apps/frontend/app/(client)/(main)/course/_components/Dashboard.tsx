'use client'

import { assignmentQueries } from '@/app/(client)/_libs/queries/assignment'
import { AssignmentIcon, ExerciseIcon } from '@/components/Icons'
import type { Assignment, AssignmentSummary } from '@/types/type'
import { useQueries } from '@tanstack/react-query'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { DashboardCalendar } from './DashboardCalendar'

type WorkStatus = 'upcoming' | 'ongoing' | 'finished'
type WorkKind = 'assignment' | 'exercise'

interface GroupInfo {
  id: number
  groupName: string
}

interface WorkItem {
  id: number
  title: string
  kind: WorkKind
  startTime: Date
  endTime: Date
  dueTime: Date
  group: GroupInfo
  problemCount: number
  submittedCount: number
  week?: number
  status?: WorkStatus
}

interface GroupedRows {
  courseTitle: string
  rows: WorkItem[]
}

const toGroupInfo = (group: Assignment['group'] | undefined): GroupInfo => ({
  id: Number.isFinite(Number(group?.id)) ? Number(group?.id) : 0,
  groupName: group?.groupName ?? 'Unknown'
})

const dayRange = (d: Date) => {
  const s = new Date(d)
  s.setHours(0, 0, 0, 0)
  const e = new Date(d)
  e.setHours(23, 59, 59, 999)
  return [s.getTime(), e.getTime()] as const
}

const isWorkOpenOnDate = (target: Date | undefined, w: WorkItem) => {
  if (!target) {
    return true
  }
  const [beg, end] = dayRange(target)
  const a = w.startTime.getTime()
  const b = w.dueTime.getTime()
  return !(b < beg || a > end)
}

export function Dashboard({ courseIds }: { courseIds: number[] }) {
  const validCourseIds = (courseIds ?? []).filter(
    (n) => Number.isFinite(n) && n > 0
  )

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [monthInView, setMonthInView] = useState<Date>(() => {
    const base = selectedDate ?? new Date()
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })

  const makeAssignmentQueries = (isExercise: boolean) =>
    validCourseIds.map((id) => ({
      ...assignmentQueries.muliple({ courseId: id, isExercise }),
      refetchOnWindowFocus: false,
      staleTime: 30_000
    }))

  const assignmentListResults = useQueries({
    queries: makeAssignmentQueries(false)
  })
  const exerciseListResults = useQueries({
    queries: makeAssignmentQueries(true)
  })

  const summaryListResults = useQueries({
    queries: validCourseIds.map((id) => ({
      ...assignmentQueries.grades({ courseId: id }),
      refetchOnWindowFocus: false,
      staleTime: 30_000
    }))
  })

  const assignmentsAll = useMemo(
    () =>
      assignmentListResults.flatMap(
        (q) => (q.data as Assignment[] | undefined) ?? []
      ),
    [assignmentListResults]
  )
  const exercisesAll = useMemo(
    () =>
      exerciseListResults.flatMap(
        (q) => (q.data as Assignment[] | undefined) ?? []
      ),
    [exerciseListResults]
  )

  const summaryById = useMemo(() => {
    const map = new Map<
      number,
      { problemCount: number; submittedCount: number }
    >()
    for (const q of summaryListResults) {
      for (const s of (q.data as AssignmentSummary[] | undefined) ?? []) {
        map.set(s.id, {
          problemCount: s.problemCount,
          submittedCount: s.submittedCount
        })
      }
    }
    return map
  }, [summaryListResults])

  const rowsAll = useMemo<WorkItem[]>(() => {
    const toRows = (list: Assignment[] | undefined, kind: WorkKind) =>
      (list ?? []).flatMap((a) => {
        const startTime = new Date(a.startTime)
        const endTime = new Date(a.endTime)
        const dueTime = new Date(a.dueTime ?? a.endTime)
        if (
          [startTime, endTime, dueTime].some((d) => Number.isNaN(d.getTime()))
        ) {
          return []
        }

        const sum = summaryById.get(a.id)
        return [
          {
            id: a.id,
            title: a.title,
            kind,
            startTime,
            endTime,
            dueTime,
            group: toGroupInfo(a.group),
            problemCount: sum?.problemCount ?? a.problemCount ?? 0,
            submittedCount: sum?.submittedCount ?? 0,
            week: a.week,
            status: a.status
          } satisfies WorkItem
        ]
      })

    return [
      ...toRows(assignmentsAll, 'assignment'),
      ...toRows(exercisesAll, 'exercise')
    ]
  }, [assignmentsAll, exercisesAll, summaryById])

  const rowsOnSelectedDate = useMemo(
    () => rowsAll.filter((w) => isWorkOpenOnDate(selectedDate, w)),
    [rowsAll, selectedDate]
  )

  const rowsGroupedByCourse = useMemo<GroupedRows[]>(() => {
    const map = new Map<string, WorkItem[]>()
    for (const r of rowsOnSelectedDate) {
      const key = r.group.groupName || 'Unknown'
      const list = map.get(key) ?? []
      list.push(r)
      map.set(key, list)
    }
    return Array.from(map, ([courseTitle, rows]) => ({ courseTitle, rows }))
  }, [rowsOnSelectedDate])

  const deadlineDateList = useMemo(() => {
    const uniq = new Set<number>()
    for (const r of rowsAll) {
      const d = new Date(r.dueTime)
      d.setHours(0, 0, 0, 0)
      uniq.add(d.getTime())
    }
    return Array.from(uniq).map((t) => new Date(t))
  }, [rowsAll])

  return (
    <section className="font-pretendard mx-auto max-w-[1208px]">
      <div className="pb-[30px]">
        <h2 className="text-[30px] font-semibold leading-9 tracking-[-0.9px] text-black">
          DASHBOARD
        </h2>
      </div>

      <div className="grid gap-[14px] md:grid-cols-2 lg:grid-cols-3">
        <CardSection
          icon={<AssignmentIcon className="h-6 w-6 fill-violet-600" />}
          title="Assignment"
          groups={rowsGroupedByCourse.map(({ courseTitle, rows }) => ({
            courseTitle,
            rows: rows.filter((x) => x.kind === 'assignment')
          }))}
        />

        <CardSection
          icon={<ExerciseIcon className="h-7 w-7 fill-violet-600" />}
          title="Exercise"
          groups={rowsGroupedByCourse.map(({ courseTitle, rows }) => ({
            courseTitle,
            rows: rows.filter((x) => x.kind === 'exercise')
          }))}
        />

        <DashboardCalendar
          selectedDate={selectedDate}
          onSelect={setSelectedDate}
          deadlineDateList={deadlineDateList}
          viewMonth={monthInView}
          setViewMonth={setMonthInView}
        />
      </div>
    </section>
  )
}

function CardSection({
  icon,
  title,
  groups
}: {
  icon: React.ReactNode
  title: string
  groups: GroupedRows[]
}) {
  return (
    <section className="font-pretendard rounded-[12px] bg-white shadow-[0_4px_20px_rgba(53,78,116,0.10)]">
      <div className="pb-[38px] pl-6 pr-6 pt-[30px]">
        <div className="mb-6 flex items-center gap-2">
          {icon}
          <div className="text-[24px] font-semibold leading-[33.6px] tracking-[-0.72px]">
            {title}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {groups
            .filter((g) => g.rows.length)
            .map((group, idx) => (
              <div key={group.courseTitle}>
                <p className="mb-3 pl-[6px] text-[14px] font-semibold leading-[19.6px] tracking-[-0.42px] text-black">
                  <span className="mr-2 inline-block h-[22px] w-[6px] rounded-[1px] bg-violet-300 align-middle" />
                  {group.courseTitle}
                </p>

                <div className="flex flex-col gap-2">
                  {group.rows.map((row) => (
                    <Link
                      key={row.id}
                      href={`/course/${row.group.id}/${row.kind === 'assignment' ? 'assignment' : 'exercise'}/${row.id}`}
                      className="group rounded-md bg-neutral-100 transition hover:bg-neutral-200"
                    >
                      <div className="flex items-center justify-between py-[10px]">
                        <div className="flex items-center">
                          <div className="pl-[18px] pr-[10px]">
                            <span className="inline-block h-2 w-2 items-center rounded-full bg-violet-500" />
                          </div>
                          <p className="truncate text-sm font-normal leading-6 tracking-[-0.48px] text-neutral-800">
                            {row.title}
                          </p>
                        </div>
                        <span className="pl-[30px] pr-[18px] text-sm text-violet-500">
                          {row.submittedCount}/{row.problemCount}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>

                {idx < groups.length - 1 && (
                  <hr className="mt-6 border-t-[0.5px] border-neutral-100" />
                )}
              </div>
            ))}
        </div>
      </div>
    </section>
  )
}
