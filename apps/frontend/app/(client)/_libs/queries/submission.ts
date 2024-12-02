import { queryOptions } from '@tanstack/react-query'
import {
  getSubmissionList,
  getSubmissionDetail,
  type GetSubmissionListRequest,
  type GetSubmissionDetailRequest
} from '../apis/submission'

export const submissionQueries = {
  all: (contestId: number) => ['contest', contestId, 'submission'] as const,
  lists: (contestId: number) =>
    [...submissionQueries.all(contestId), 'list'] as const,
  list: ({ contestId, problemId, ...searchParams }: GetSubmissionListRequest) =>
    queryOptions({
      queryKey: [
        ...submissionQueries.lists(contestId),
        { problemId, ...searchParams }
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
        ...submissionQueries.all(contestId),
        'detail',
        submissionId,
        { problemId }
      ] as const,
      queryFn: () => getSubmissionDetail({ contestId, submissionId, problemId })
    })
}
