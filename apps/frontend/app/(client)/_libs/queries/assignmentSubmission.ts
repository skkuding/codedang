import { queryOptions } from '@tanstack/react-query'
import {
  getAssignmentSubmissionDetail,
  getAssignmentSubmissionList,
  type GetAssignmentSubmissionDetailRequest,
  type GetAssignmentSubmissionListRequest
} from '../apis/assignmentSubmission'

export const assignmentSubmissionQueries = {
  all: ({
    assignmentId,
    problemId
  }: {
    assignmentId: number
    problemId: number
  }) => ['submission', 'assignment', assignmentId, { problemId }] as const,

  lists: ({
    assignmentId,
    problemId
  }: {
    assignmentId: number
    problemId: number
  }) =>
    [
      ...assignmentSubmissionQueries.all({ assignmentId, problemId }),
      'list'
    ] as const,

  list: ({
    assignmentId,
    problemId,
    ...searchParams
  }: GetAssignmentSubmissionListRequest) =>
    queryOptions({
      queryKey: [
        ...assignmentSubmissionQueries.lists({ assignmentId, problemId }),
        { ...searchParams }
      ] as const,
      queryFn: () =>
        getAssignmentSubmissionList({
          assignmentId,
          problemId,
          ...searchParams
        })
    }),

  detail: ({
    assignmentId,
    submissionId,
    problemId
  }: GetAssignmentSubmissionDetailRequest) =>
    queryOptions({
      queryKey: [
        ...assignmentSubmissionQueries.all({ assignmentId, problemId }),
        'detail',
        submissionId
      ] as const,
      queryFn: () =>
        getAssignmentSubmissionDetail({ assignmentId, submissionId, problemId })
    })
}
