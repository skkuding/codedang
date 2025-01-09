import { queryOptions } from '@tanstack/react-query'
import {
  getSubmissionList,
  getSubmissionDetail,
  type GetSubmissionListRequest,
  type GetSubmissionDetailRequest
} from '../apis/submission'

export const submissionQueries = {
  all: ({ contestId, problemId }: { contestId: number; problemId: number }) =>
    ['submission', 'contest', contestId, { problemId }] as const,

  lists: ({ contestId, problemId }: { contestId: number; problemId: number }) =>
    [...submissionQueries.all({ contestId, problemId }), 'list'] as const,

  list: ({ contestId, problemId, ...searchParams }: GetSubmissionListRequest) =>
    queryOptions({
      queryKey: [
        ...submissionQueries.lists({ contestId, problemId }),
        { ...searchParams }
      ] as const,
      queryFn: () =>
        getSubmissionList({ contestId, problemId, ...searchParams })
    }),

  detail: ({
    contestId,
    submissionId,
    problemId
  }: GetSubmissionDetailRequest) =>
    queryOptions({
      queryKey: [
        ...submissionQueries.all({ contestId, problemId }),
        'detail',
        submissionId
      ] as const,
      queryFn: () => getSubmissionDetail({ contestId, submissionId, problemId })
    })
}
