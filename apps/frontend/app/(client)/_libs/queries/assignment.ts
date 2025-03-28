import { queryOptions } from '@tanstack/react-query'
import {
  getAssignment,
  getAssignmentProblemRecord,
  getAssignments,
  getAssignmentsSummary,
  type GetAssignmentProblemRecordRequest,
  type GetAssignmentRequest,
  type GetAssignmentsRequest,
  type GetAssignmentsSummaryRequest
} from '../apis/assignment'

export const assignmentQueries = {
  single: ({ assignmentId }: GetAssignmentRequest) =>
    queryOptions({
      queryKey: ['assignment', assignmentId],
      queryFn: () => getAssignment({ assignmentId })
    }),
  muliple: ({ courseId }: GetAssignmentsRequest) =>
    queryOptions({
      queryKey: ['assignments', courseId],
      queryFn: () => getAssignments({ courseId })
    }),
  record: ({ assignmentId }: GetAssignmentProblemRecordRequest) =>
    queryOptions({
      queryKey: ['record', assignmentId],
      queryFn: () => getAssignmentProblemRecord({ assignmentId })
    }),
  grades: ({ courseId }: GetAssignmentsSummaryRequest) =>
    queryOptions({
      queryKey: ['grades', courseId],
      queryFn: () => getAssignmentsSummary({ courseId })
    })
}
