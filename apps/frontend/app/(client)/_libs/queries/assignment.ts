import { queryOptions } from '@tanstack/react-query'
import {
  getAssignment,
  getAssignmentRecord,
  getAssignments,
  type GetAssignmentRecordRequest,
  type GetAssignmentRequest,
  type GetAssignmentsRequest
} from '../apis/assignment'

export const assignmentQueries = {
  single: ({ assignmentId }: GetAssignmentRequest) =>
    queryOptions({
      queryKey: ['assignment', assignmentId],
      queryFn: () => getAssignment({ assignmentId })
    }),
  muliple: ({ courseId }: GetAssignmentsRequest) =>
    queryOptions({
      queryKey: ['course', courseId],
      queryFn: () => getAssignments({ courseId })
    }),
  record: ({ assignmentId }: GetAssignmentRecordRequest) =>
    queryOptions({
      queryKey: ['assignment', assignmentId],
      queryFn: () => getAssignmentRecord({ assignmentId })
    })
}
