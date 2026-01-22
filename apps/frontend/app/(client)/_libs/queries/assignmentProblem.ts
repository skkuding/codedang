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
  list: ({ assignmentId, groupId }: GetAssignmentProblemListRequest) =>
    queryOptions({
      queryKey: [assignmentId, groupId] as const,
      queryFn: () => getAssignmentProblemList({ assignmentId, groupId })
    })
}
