import type { Assignment } from '@/types/type'
import type { CourseAssignmentList } from './types'
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

const createCourseAssignmentLists = (
  courseAssignments: CourseAssignment[],
  selectedDate?: Date
): CourseAssignmentList[] => {
  const assignmentListsByCourseId = new Map<
    number,
    { courseTitle: string; assignments: Assignment[] }
  >()

  for (const { courseId, courseTitle, assignment } of courseAssignments) {
    const courseAssignmentList = assignmentListsByCourseId.get(courseId) ?? {
      courseTitle,
      assignments: []
    }
    courseAssignmentList.assignments.push(assignment)
    assignmentListsByCourseId.set(courseId, courseAssignmentList)
  }

  return [...assignmentListsByCourseId]
    .map(([courseId, courseAssignmentList]) => ({
      courseId,
      courseTitle: courseAssignmentList.courseTitle,
      assignments: courseAssignmentList.assignments.sort((a, b) => {
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
          b.assignments.some((assignment) =>
            isDueToday(selectedDate, assignment.dueTime ?? assignment.endTime)
          )
        ) -
        Number(
          a.assignments.some((assignment) =>
            isDueToday(selectedDate, assignment.dueTime ?? assignment.endTime)
          )
        )

      return dueRank || a.courseTitle.localeCompare(b.courseTitle)
    })
}

const createDashboardViewModel = ({
  assignments,
  selectedDate
}: CreateDashboardViewModelParams) => {
  const courseAssignments = assignments.flatMap((assignment) => {
    const dashboardAssignment = toDashboardAssignment(assignment)
    return dashboardAssignment ? [dashboardAssignment] : []
  })
  const visibleAssignments = courseAssignments.filter(
    ({ assignment }) =>
      isNotExpired(assignment) && isActiveOnDate(selectedDate, assignment)
  )
  const deadlineTimestamps = new Set(
    courseAssignments
      .map(({ assignment }) => assignment)
      .filter(isNotExpired)
      .map((assignment) =>
        startOfDay(new Date(assignment.dueTime ?? assignment.endTime)).getTime()
      )
  )

  return {
    assignmentListsByCourse: createCourseAssignmentLists(
      visibleAssignments.filter(({ assignment }) => !assignment.isExercise),
      selectedDate
    ),
    exerciseListsByCourse: createCourseAssignmentLists(
      visibleAssignments.filter(({ assignment }) => assignment.isExercise),
      selectedDate
    ),
    deadlineDateList: [...deadlineTimestamps].map(
      (timestamp) => new Date(timestamp)
    )
  }
}

export { createDashboardViewModel }
