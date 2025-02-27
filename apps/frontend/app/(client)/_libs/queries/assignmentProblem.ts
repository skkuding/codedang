import { queryOptions } from '@tanstack/react-query'
import {
  getAssignmentProblemList,
  type GetAssignmentProblemListRequest
} from '../apis/assignmentProblem'

export const assignmentProblemQueries = {
  all: (assignmentId: number) =>
    ['assignment', assignmentId, 'problem'] as const,
  lists: (assignmentId: number) =>
    [...assignmentProblemQueries.all(assignmentId), 'list'] as const,
  list: ({ assignmentId, ...searchParams }: GetAssignmentProblemListRequest) =>
    queryOptions({
      queryKey: [
        ...assignmentProblemQueries.lists(assignmentId),
        { ...searchParams }
      ] as const,
      queryFn: () => getAssignmentProblemList({ assignmentId, ...searchParams })
    })
}
