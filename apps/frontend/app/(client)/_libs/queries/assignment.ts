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
  muliple: ({ courseId, isExercise }: GetAssignmentsRequest) =>
    queryOptions({
      queryKey: ['assignments', courseId, isExercise],
      queryFn: () => getAssignments({ courseId, isExercise })
    }),
  record: ({ assignmentId }: GetAssignmentProblemRecordRequest) =>
    queryOptions({
      queryKey: ['record', assignmentId],
      queryFn: () => getAssignmentProblemRecord({ assignmentId })
    }),
  grades: ({ courseId, isExercise }: GetAssignmentsSummaryRequest) =>
    queryOptions({
      queryKey: ['grades', courseId, isExercise],
      queryFn: () => getAssignmentsSummary({ courseId, isExercise })
    })
}
