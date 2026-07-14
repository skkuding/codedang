import type { Assignment, JoinedCourse } from '@/types/type'
import type { GroupedRows, WorkItem } from './types'
import { isActiveOnDate, isNotExpired, startOfDay } from './utils'

interface CreateDashboardViewModelParams {
  assignments: Assignment[]
  courses: JoinedCourse[]
  selectedDate?: Date
}

const toWorkItem = (assignment: Assignment): WorkItem | null => {
  const startTime = new Date(assignment.startTime)
  const endTime = new Date(assignment.endTime)
  const dueTime = new Date(assignment.dueTime ?? assignment.endTime)

  if (
    [startTime, endTime, dueTime].some((date) => Number.isNaN(date.getTime()))
  ) {
    return null
  }

  return {
    id: assignment.id,
    title: assignment.title,
    isExercise: assignment.isExercise,
    startTime,
    endTime,
    dueTime,
    group: {
      id: Number.isFinite(Number(assignment.group?.id))
        ? Number(assignment.group.id)
        : 0,
      groupName: assignment.group?.groupName ?? 'Unknown'
    },
    problemCount: assignment.problemCount ?? 0,
    week: assignment.week,
    status: assignment.status,
    raw: assignment
  }
}

const groupRowsByCourse = (
  rows: WorkItem[],
  courses: JoinedCourse[]
): GroupedRows[] => {
  const rowsByCourse = new Map<number, WorkItem[]>()

  for (const row of rows) {
    const courseRows = rowsByCourse.get(row.group.id) ?? []
    courseRows.push(row)
    rowsByCourse.set(row.group.id, courseRows)
  }

  return [...rowsByCourse]
    .map(([courseId, courseRows]) => {
      const course = courses.find(({ id }) => id === courseId)

      return {
        courseId,
        courseNum: course?.courseInfo.courseNum,
        classNum: course?.courseInfo.classNum,
        courseTitle: courseRows[0].group.groupName || 'Unknown',
        rows: courseRows
      }
    })
    .sort((a, b) => a.courseTitle.localeCompare(b.courseTitle))
}

const createDashboardViewModel = ({
  assignments,
  courses,
  selectedDate
}: CreateDashboardViewModelParams) => {
  const allRows = assignments.flatMap((assignment) => {
    const workItem = toWorkItem(assignment)
    return workItem ? [workItem] : []
  })
  const visibleRows = allRows.filter(
    (workItem) =>
      isNotExpired(workItem) && isActiveOnDate(selectedDate, workItem)
  )
  const deadlineTimestamps = new Set(
    allRows
      .filter(isNotExpired)
      .map((row) => startOfDay(new Date(row.dueTime ?? row.endTime)).getTime())
  )

  return {
    assignmentGroups: groupRowsByCourse(
      visibleRows.filter((row) => !row.isExercise),
      courses
    ),
    exerciseGroups: groupRowsByCourse(
      visibleRows.filter((row) => row.isExercise),
      courses
    ),
    deadlineDateList: [...deadlineTimestamps].map(
      (timestamp) => new Date(timestamp)
    )
  }
}

export { createDashboardViewModel }
