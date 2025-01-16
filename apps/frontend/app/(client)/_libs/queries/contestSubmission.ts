import { queryOptions } from '@tanstack/react-query'
import {
  getContestSubmissionDetail,
  getContestSubmissionList,
  type GetContestSubmissionDetailRequest,
  type GetContestSubmissionListRequest
} from '../apis/contestSubmission'

export const contestSubmissionQueries = {
  all: ({ contestId, problemId }: { contestId: number; problemId: number }) =>
    ['submission', 'contest', contestId, { problemId }] as const,

  lists: ({ contestId, problemId }: { contestId: number; problemId: number }) =>
    [
      ...contestSubmissionQueries.all({ contestId, problemId }),
      'list'
    ] as const,

  list: ({
    contestId,
    problemId,
    ...searchParams
  }: GetContestSubmissionListRequest) =>
    queryOptions({
      queryKey: [
        ...contestSubmissionQueries.lists({ contestId, problemId }),
        { ...searchParams }
      ] as const,
      queryFn: () =>
        getContestSubmissionList({ contestId, problemId, ...searchParams })
    }),

  detail: ({
    contestId,
    submissionId,
    problemId
  }: GetContestSubmissionDetailRequest) =>
    queryOptions({
      queryKey: [
        ...contestSubmissionQueries.all({ contestId, problemId }),
        'detail',
        submissionId
      ] as const,
      queryFn: () =>
        getContestSubmissionDetail({ contestId, submissionId, problemId })
    })
}
