import type { Assignment } from '@/types/type'
import type { GroupedRows } from './types'
import { isActiveOnDate, isDueToday, isNotExpired, startOfDay } from './utils'

interface CreateDashboardViewModelParams {
  assignments: Assignment[]
  selectedDate?: Date
}

interface CourseAssignment {
  courseId: number
  courseTitle: string
  assignment: Assignment
}

const toDashboardAssignment = (
  assignment: Assignment
): CourseAssignment | null => {
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
    assignment: {
      ...assignment,
      startTime,
      endTime,
      dueTime
    }
  }
}

const groupRowsByCourse = (
  rows: CourseAssignment[],
  selectedDate?: Date
): GroupedRows[] => {
  const groupsByCourse = new Map<
    number,
    { courseTitle: string; rows: Assignment[] }
  >()

  for (const { courseId, courseTitle, assignment } of rows) {
    const group = groupsByCourse.get(courseId) ?? { courseTitle, rows: [] }
    group.rows.push(assignment)
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
    const dashboardAssignment = toDashboardAssignment(assignment)
    return dashboardAssignment ? [dashboardAssignment] : []
  })
  const visibleRows = allRows.filter(
    ({ assignment }) =>
      isNotExpired(assignment) && isActiveOnDate(selectedDate, assignment)
  )
  const deadlineTimestamps = new Set(
    allRows
      .map(({ assignment }) => assignment)
      .filter(isNotExpired)
      .map((assignment) =>
        startOfDay(new Date(assignment.dueTime ?? assignment.endTime)).getTime()
      )
  )

  return {
    assignmentGroups: groupRowsByCourse(
      visibleRows.filter(({ assignment }) => !assignment.isExercise),
      selectedDate
    ),
    exerciseGroups: groupRowsByCourse(
      visibleRows.filter(({ assignment }) => assignment.isExercise),
      selectedDate
    ),
    deadlineDateList: [...deadlineTimestamps].map(
      (timestamp) => new Date(timestamp)
    )
  }
}

export { createDashboardViewModel }
