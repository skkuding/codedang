import type { Assignment } from '@/types/type'
import type { GroupedRows, WorkItem } from './types'
import { isActiveOnDate, isDueToday, isNotExpired, startOfDay } from './utils'

interface CreateDashboardViewModelParams {
  assignments: Assignment[]
  selectedDate?: Date
}

interface CourseWorkItem {
  courseId: number
  courseTitle: string
  workItem: WorkItem
}

const toWorkItem = (assignment: Assignment): CourseWorkItem | null => {
  const startTime = new Date(assignment.startTime)
  const endTime = new Date(assignment.endTime)
  const dueTime = new Date(assignment.dueTime ?? assignment.endTime)

  if (
    [startTime, endTime, dueTime].some((date) => Number.isNaN(date.getTime()))
  ) {
    return null
  }

  return {
    courseId: Number.isFinite(Number(assignment.group?.id))
      ? Number(assignment.group.id)
      : 0,
    courseTitle: assignment.group?.groupName ?? 'Unknown',
    workItem: {
      id: assignment.id,
      title: assignment.title,
      isExercise: assignment.isExercise,
      startTime,
      endTime,
      dueTime,
      problemCount: assignment.problemCount ?? 0,
      week: assignment.week,
      status: assignment.status,
      raw: assignment
    }
  }
}

const groupRowsByCourse = (
  rows: CourseWorkItem[],
  selectedDate?: Date
): GroupedRows[] => {
  const groupsByCourse = new Map<
    number,
    { courseTitle: string; rows: WorkItem[] }
  >()

  for (const { courseId, courseTitle, workItem } of rows) {
    const group = groupsByCourse.get(courseId) ?? { courseTitle, rows: [] }
    group.rows.push(workItem)
    groupsByCourse.set(courseId, group)
  }

  return [...groupsByCourse]
    .map(([courseId, group]) => ({
      courseId,
      courseTitle: group.courseTitle,
      rows: group.rows.sort((a, b) => {
        const dueRank =
          Number(isDueToday(selectedDate, b.dueTime ?? b.endTime)) -
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
    }))
    .sort((a, b) => {
      const dueRank =
        Number(
          b.rows.some((row) =>
            isDueToday(selectedDate, row.dueTime ?? row.endTime)
          )
        ) -
        Number(
          a.rows.some((row) =>
            isDueToday(selectedDate, row.dueTime ?? row.endTime)
          )
        )

      return dueRank || a.courseTitle.localeCompare(b.courseTitle)
    })
}

const createDashboardViewModel = ({
  assignments,
  selectedDate
}: CreateDashboardViewModelParams) => {
  const allRows = assignments.flatMap((assignment) => {
    const workItem = toWorkItem(assignment)
    return workItem ? [workItem] : []
  })
  const visibleRows = allRows.filter(
    ({ workItem }) =>
      isNotExpired(workItem) && isActiveOnDate(selectedDate, workItem)
  )
  const deadlineTimestamps = new Set(
    allRows
      .map(({ workItem }) => workItem)
      .filter(isNotExpired)
      .map((workItem) =>
        startOfDay(new Date(workItem.dueTime ?? workItem.endTime)).getTime()
      )
  )

  return {
    assignmentGroups: groupRowsByCourse(
      visibleRows.filter(({ workItem }) => !workItem.isExercise),
      selectedDate
    ),
    exerciseGroups: groupRowsByCourse(
      visibleRows.filter(({ workItem }) => workItem.isExercise),
      selectedDate
    ),
    deadlineDateList: [...deadlineTimestamps].map(
      (timestamp) => new Date(timestamp)
    )
  }
}

export { createDashboardViewModel }
