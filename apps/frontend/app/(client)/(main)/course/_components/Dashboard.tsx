'use client'

import { assignmentQueries } from '@/app/(client)/_libs/queries/assignment'
import { ScrollArea } from '@/components/shadcn/scroll-area'
import { fetcherWithAuth } from '@/libs/utils'
import type { Assignment, AssignmentSummary, JoinedCourse } from '@/types/type'
import {
  useQueries,
  useQuery,
  type UseQueryOptions
} from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { AssignmentLink } from '../[courseId]/_components/AssignmentLink'
import { DashboardCalendar } from './DashboardCalendar'

type WorkStatus = 'upcoming' | 'ongoing' | 'finished'

interface GroupInfo {
  id: number
  groupName: string
}

interface WorkItem {
  id: number
  title: string
  isExercise: boolean
  startTime: Date
  endTime: Date
  dueTime?: Date
  group: GroupInfo
  problemCount: number
  submittedCount: number
  week?: number
  status?: WorkStatus
  raw: Assignment
}

interface GroupedRows {
  courseId: number
  courseTitle: string
  courseNum?: string
  classNum?: number
  rows: WorkItem[]
}

interface CardSectionProps {
  title: string
  groups: GroupedRows[]
  selectedDate?: Date
  courseIdResolver: (row: WorkItem) => number
}

const startOfDay = (date: Date) => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

const todayAtMidnight = () => startOfDay(new Date())

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

const isActiveOnDate = (selectedDate: Date | undefined, workItem: WorkItem) => {
  if (!selectedDate) {
    return true
  }
  const selectedStart = startOfDay(selectedDate).getTime()
  const selectedEnd = selectedStart + 86_400_000 - 1
  const startTime = workItem.startTime.getTime()
  const dueTime = workItem.dueTime?.getTime() ?? workItem.endTime.getTime()
  return !(dueTime < selectedStart || startTime > selectedEnd)
}

const formatDueMd = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`

const isDueToday = (selectedDate?: Date, dueDate?: Date) =>
  Boolean(selectedDate && dueDate && sameDay(selectedDate, dueDate))

const toGroupInfo = (group: Assignment['group'] | undefined): GroupInfo => ({
  id: Number.isFinite(Number(group?.id)) ? Number(group?.id) : 0,
  groupName: group?.groupName ?? 'Unknown'
})

const makeAssignmentQueries = (
  courseIds: number[],
  isExercise: boolean
): UseQueryOptions<Assignment[], Error>[] =>
  courseIds.map((courseId) => {
    const base = assignmentQueries.muliple({ courseId, isExercise })
    const queryFn: UseQueryOptions<Assignment[], Error>['queryFn'] = async (
      ctx
    ) => {
      type Ctx = { queryKey: readonly unknown[]; signal?: AbortSignal }
      const fn = base.queryFn as unknown as (c?: Ctx) => Promise<unknown>
      return (await fn(ctx as Ctx)) as Assignment[]
    }
    return {
      queryKey: [
        ...(base.queryKey as readonly unknown[]),
        isExercise ? 'exercise' : 'assignment'
      ] as const,
      queryFn,
      refetchOnWindowFocus: false,
      staleTime: 30_000
    }
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
    if (selectedDate && sameDay(selectedDate, normalized)) {
      setSelectedDate(today)
      setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1))
    } else {
      setSelectedDate(normalized)
      setViewMonth(new Date(normalized.getFullYear(), normalized.getMonth(), 1))
    }
  }

  const assignmentQueriesResult = useQueries({
    queries: makeAssignmentQueries(validCourseIds, false)
  })
  const exerciseQueriesResult = useQueries({
    queries: makeAssignmentQueries(validCourseIds, true)
  })

  const summaryQueriesResult = useQueries({
    queries: validCourseIds.map((id) => ({
      ...assignmentQueries.grades({ courseId: id }),
      refetchOnWindowFocus: false,
      staleTime: 30_000
    }))
  })

  const assignments = useMemo<Assignment[]>(
    () => assignmentQueriesResult.flatMap((q) => q.data ?? []),
    [assignmentQueriesResult]
  )

  const exercises = useMemo<Assignment[]>(
    () => exerciseQueriesResult.flatMap((q) => q.data ?? []),
    [exerciseQueriesResult]
  )

  const summaryByAssignmentId = useMemo(() => {
    const map = new Map<
      number,
      { problemCount: number; submittedCount: number }
    >()
    for (const q of summaryQueriesResult) {
      for (const s of (q.data as AssignmentSummary[] | undefined) ?? []) {
        map.set(s.id, {
          problemCount: s.problemCount,
          submittedCount: s.submittedCount
        })
      }
    }
    return map
  }, [summaryQueriesResult])

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
        const summary = summaryByAssignmentId.get(a.id)
        return [
          {
            id: a.id,
            title: a.title,
            isExercise,
            startTime,
            endTime,
            dueTime,
            group: toGroupInfo(a.group),
            problemCount: summary?.problemCount ?? a.problemCount ?? 0,
            submittedCount: summary?.submittedCount ?? 0,
            week: a.week,
            status: a.status,
            raw: a
          } satisfies WorkItem
        ]
      })
    return [...toRows(assignments, false), ...toRows(exercises, true)]
  }, [assignments, exercises, summaryByAssignmentId])

  const visibleRows = useMemo(
    () => allRows.filter((workItem) => isActiveOnDate(selectedDate, workItem)),
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
    for (const row of allRows) {
      const t = startOfDay(new Date(row.dueTime ?? row.endTime)).getTime()
      uniq.add(t)
    }
    return [...uniq].map((t) => new Date(t))
  }, [allRows])
  const courseIdResolver = (row: WorkItem) => row.group.id

  return (
    <section className="mx-auto max-w-[1208px]">
      <div className="pb-4 sm:pb-[30px]">
        <h2 className="text-head5_sb_24 md:text-[28px]">나의 대시보드</h2>
      </div>
      <div className="grid grid-cols-1 gap-[14px] md:grid md:grid-cols-2 lg:grid-cols-3">
        <div className="order-2 flex max-h-[460px] flex-col md:order-1">
          <CardSection
            title="Assignment"
            groups={groupedByCourse.map((group) => ({
              ...group,
              rows: group.rows.filter((r) => !r.isExercise)
            }))}
            selectedDate={selectedDate}
            courseIdResolver={courseIdResolver}
          />
        </div>

        <div className="order-3 flex max-h-[460px] flex-col md:order-2">
          <CardSection
            title="Exercise"
            groups={groupedByCourse.map((group) => ({
              ...group,
              rows: group.rows.filter((r) => r.isExercise)
            }))}
            selectedDate={selectedDate}
            courseIdResolver={courseIdResolver}
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

function CardSection({
  title,
  groups,
  selectedDate,
  courseIdResolver
}: CardSectionProps) {
  return (
    <section className="flex h-full rounded-[12px] bg-white shadow-[0_4px_20px_rgba(53,78,116,0.10)]">
      <div className="flex w-full max-w-[100vw] flex-col overflow-hidden py-[30px] pl-6 pr-2 md:max-w-[390px]">
        <span className="text-head5_sb_24 mb-6">{title}</span>

        <ScrollArea className="flex-1 pr-4 [&>div>div]:!flex [&>div>div]:!flex-col">
          {groups
            .slice()
            .sort(
              (groupA, groupB) =>
                Number(
                  groupB.rows.some((r) =>
                    isDueToday(selectedDate, r.dueTime ?? r.endTime)
                  )
                ) -
                Number(
                  groupA.rows.some((r) =>
                    isDueToday(selectedDate, r.dueTime ?? r.endTime)
                  )
                )
            )
            .filter((g) => g.rows.length)
            .map((group, idx) => (
              <div key={group.courseTitle} className="w-full">
                <p className="text-sub4_sb_14 mb-3 pl-[6px] text-black">
                  <span className="bg-primary-light mr-2 inline-block h-[22px] w-[6px] rounded-[1px] align-middle" />
                  {group.courseTitle}
                </p>

                <div className="flex flex-col gap-2">
                  {group.rows
                    .slice()
                    .sort((a, b) => {
                      const dueRank =
                        Number(
                          isDueToday(selectedDate, b.dueTime ?? b.endTime)
                        ) -
                        Number(isDueToday(selectedDate, a.dueTime ?? a.endTime))
                      if (dueRank !== 0) {
                        return dueRank
                      }
                      const dueA = a.dueTime?.getTime() ?? a.endTime.getTime()
                      const dueB = b.dueTime?.getTime() ?? b.endTime.getTime()
                      if (dueA !== dueB) {
                        return dueA - dueB
                      }
                      return a.title.localeCompare(b.title)
                    })
                    .map((row) => {
                      const courseId = courseIdResolver(row)

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
                                  assignment={row.raw}
                                  courseId={courseId}
                                  isExercise={row.isExercise}
                                />
                              </div>
                            </div>

                            <span className="text-primary text-body2_m_14 ml-3 w-[70px] shrink-0 whitespace-nowrap pr-[18px] text-right tabular-nums">
                              {'~ '}
                              {formatDueMd(row.dueTime ?? row.endTime)}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                </div>

                {idx < groups.length - 1 && (
                  <hr className="my-6 border-t-[0.5px] border-neutral-100" />
                )}
              </div>
            ))}
        </ScrollArea>
      </div>
    </section>
  )
}
