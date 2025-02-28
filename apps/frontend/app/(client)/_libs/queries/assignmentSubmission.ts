import { queryOptions } from '@tanstack/react-query'
import {
  getAssignmentScore,
  getAssignmentSubmissionDetail,
  getAssignmentSubmissionList,
  getProblemSubmissionResult,
  getTestResult,
  type GetAssignmentScoreRequest,
  type GetAssignmentSubmissionDetailRequest,
  type GetAssignmentSubmissionListRequest,
  type GetProblemSubmissionResultRequest,
  type GetTestResultRequest
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
    }),

  score: ({ assignmentId, courseId }: GetAssignmentScoreRequest) =>
    queryOptions({
      queryKey: ['assignment', assignmentId, courseId],
      queryFn: () => getAssignmentScore({ assignmentId, courseId })
    }),

  problemScore: ({
    assignmentId,
    problemId
  }: GetProblemSubmissionResultRequest) =>
    queryOptions({
      queryKey: ['assignment', assignmentId, problemId],
      queryFn: () => getProblemSubmissionResult({ assignmentId, problemId })
    }),

  testResult: ({
    assignmentId,
    problemId,
    submissionId
  }: GetTestResultRequest) =>
    queryOptions({
      queryKey: ['assignment', assignmentId, problemId, submissionId],
      queryFn: () => getTestResult({ assignmentId, problemId, submissionId })
    })
}
