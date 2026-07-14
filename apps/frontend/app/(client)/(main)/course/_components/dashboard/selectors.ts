import type { Assignment } from '@/types/type'
import type { DashboardCourseSection } from './types'
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

const createCourseSections = (
  courseAssignments: CourseAssignment[],
  selectedDate?: Date
): DashboardCourseSection[] => {
  const sectionsByCourseId = new Map<
    number,
    { courseTitle: string; assignments: Assignment[] }
  >()

  for (const { courseId, courseTitle, assignment } of courseAssignments) {
    const courseSection = sectionsByCourseId.get(courseId) ?? {
      courseTitle,
      assignments: []
    }
    courseSection.assignments.push(assignment)
    sectionsByCourseId.set(courseId, courseSection)
  }

  return [...sectionsByCourseId]
    .map(([courseId, courseSection]) => ({
      courseId,
      courseTitle: courseSection.courseTitle,
      assignments: courseSection.assignments.sort((a, b) => {
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
    assignmentCourseSections: createCourseSections(
      visibleAssignments.filter(({ assignment }) => !assignment.isExercise),
      selectedDate
    ),
    exerciseCourseSections: createCourseSections(
      visibleAssignments.filter(({ assignment }) => assignment.isExercise),
      selectedDate
    ),
    deadlineDateList: [...deadlineTimestamps].map(
      (timestamp) => new Date(timestamp)
    )
  }
}

export { createDashboardViewModel }
