import { assignmentQueries } from '@/app/(client)/_libs/queries/assignment'
import { courseQueries } from '@/app/(client)/_libs/queries/course'
import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query'

const useDashboardAssignments = () => {
  const { data: courses } = useSuspenseQuery(courseQueries.joined())

  return useSuspenseQueries({
    queries: courses.map(({ id: courseId }) => ({
      ...assignmentQueries.multiple({ courseId }),
      staleTime: 30_000
    })),
    combine: (results) => results.flatMap(({ data }) => data)
  })
}

export { useDashboardAssignments }
