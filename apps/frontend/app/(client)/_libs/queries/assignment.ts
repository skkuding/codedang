import { queryOptions } from '@tanstack/react-query'
import { getAssignment, type GetAssignmentRequest } from '../apis/assignment'
import {
  getAssignmentProblemList,
  type GetAssignmentProblemListRequest
} from '../apis/assignmentProblem'

export const assignmentQueries = {
  all: (assignmentId: number) =>
    ['assignment', assignmentId, 'problem'] as const,
  lists: (assignmentId: number) =>
    [...assignmentQueries.all(assignmentId), 'list'] as const,
  list: ({ assignmentId, ...searchParams }: GetAssignmentProblemListRequest) =>
    queryOptions({
      queryKey: [
        ...assignmentQueries.lists(assignmentId),
        { ...searchParams }
      ] as const,
      queryFn: () => getAssignmentProblemList({ assignmentId, ...searchParams })
    }),
  single: ({ assignmentId }: GetAssignmentRequest) =>
    queryOptions({
      queryKey: ['assignment', assignmentId],
      queryFn: () => getAssignment({ assignmentId })
    })
}
