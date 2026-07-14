import { fetcherWithAuth } from '@/libs/utils'
import type { JoinedCourse } from '@/types/type'
import { queryOptions } from '@tanstack/react-query'

const courseQueries = {
  joined: () =>
    queryOptions({
      queryKey: ['joinedCourses'],
      queryFn: () => fetcherWithAuth.get('course/joined').json<JoinedCourse[]>()
    })
}

export { courseQueries }
