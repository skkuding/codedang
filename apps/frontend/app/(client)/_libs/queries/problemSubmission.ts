import { queryOptions } from '@tanstack/react-query'
import {
  getProblemSubmissionList,
  type GetProblemSubmissionListRequest
} from '../apis/problemSubmission'

export const problemSubmissionQueries = {
  all: (problemId: number) => ['submission', 'problem', problemId] as const,

  lists: (problemId: number) =>
    [...problemSubmissionQueries.all(problemId), 'list'] as const,

  list: ({ problemId, ...searchParams }: GetProblemSubmissionListRequest) =>
    queryOptions({
      queryKey: [
        ...problemSubmissionQueries.lists(problemId),
        { ...searchParams }
      ] as const,
      queryFn: () => getProblemSubmissionList({ problemId, ...searchParams })
    })
}
