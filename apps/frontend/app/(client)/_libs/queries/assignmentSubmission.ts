import { queryOptions } from '@tanstack/react-query'
import {
  getAnonymizedScores,
  getAssignmentGrades,
  getAssignmentSubmission,
  getAssignmentSubmissionDetail,
  getAssignmentSubmissionList,
  getLatestProblemSubmissionResult,
  getProblemSubmissionResults,
  getTestResult,
  type GetAnonymizedScoresRequest,
  type GetAssignmentGradesRequest,
  type GetAssignmentSubmissionDetailRequest,
  type GetAssignmentSubmissionListRequest,
  type GetAssignmentSubmissionSummaryRequest,
  type GetLatestProblemSubmissionResultRequest,
  type GetProblemSubmissionResultsRequest,
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

  anonymizedScores: ({ assignmentId, courseId }: GetAnonymizedScoresRequest) =>
    queryOptions({
      queryKey: ['assignment', assignmentId, courseId],
      queryFn: () => getAnonymizedScores({ assignmentId, courseId })
    }),

  lastestSubmissionResult: ({
    assignmentId,
    problemId
  }: GetLatestProblemSubmissionResultRequest) =>
    queryOptions({
      queryKey: ['assignment', assignmentId, problemId],
      queryFn: () =>
        getLatestProblemSubmissionResult({
          assignmentId,
          problemId
        })
    }),

  submissionResults: ({
    assignmentId,
    problemId
  }: GetProblemSubmissionResultsRequest) =>
    queryOptions({
      queryKey: ['assignment', assignmentId, problemId],
      queryFn: () => getProblemSubmissionResults({ assignmentId, problemId })
    }),

  testResult: ({
    assignmentId,
    problemId,
    submissionId
  }: GetTestResultRequest) =>
    queryOptions({
      queryKey: ['assignment', assignmentId, problemId, submissionId],
      queryFn: () => getTestResult({ assignmentId, problemId, submissionId }),
      enabled: Boolean(submissionId)
    }),

  grades: ({ groupId }: GetAssignmentGradesRequest) =>
    queryOptions({
      queryKey: ['assignmentGrades', groupId],
      queryFn: () => getAssignmentGrades({ groupId })
    }),
  summary: ({ assignmentId }: GetAssignmentSubmissionSummaryRequest) =>
    queryOptions({
      queryKey: ['summary', assignmentId],
      queryFn: () => getAssignmentSubmission({ assignmentId })
    })
}
