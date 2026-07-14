import { assignmentQueries } from '@/app/(client)/_libs/queries/assignment'
import { fetcherWithAuth } from '@/libs/utils'
import type { Assignment, JoinedCourse } from '@/types/type'
import { useQueries, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

const useDashboardAssignments = () => {
  const { data: courses = [] } = useQuery({
    queryKey: ['joinedCourses'],
    queryFn: async () =>
      await fetcherWithAuth.get('course/joined').json<JoinedCourse[]>()
  })

  const courseIds = useMemo(
    () => courses.map((course) => course.id).filter((id) => id > 0),
    [courses]
  )

  const assignmentQueriesResult = useQueries({
    queries: courseIds.map((courseId) => ({
      ...assignmentQueries.multiple({ courseId }),
      staleTime: 30_000
    }))
  })

  const assignments = useMemo<Assignment[]>(
    () => assignmentQueriesResult.flatMap((query) => query.data ?? []),
    [assignmentQueriesResult]
  )

  return { assignments, courses }
}

export { useDashboardAssignments }
