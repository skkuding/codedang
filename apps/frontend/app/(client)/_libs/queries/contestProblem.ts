import { queryOptions } from '@tanstack/react-query'
import {
  getContestProblemList,
  type GetContestProblemListRequest
} from '../apis/contestProblem'

export const contestProblemQueries = {
  all: (contestId: number) => ['contest', contestId, 'problem'] as const,
  lists: (contestId: number) =>
    [...contestProblemQueries.all(contestId), 'list'] as const,
  list: ({ contestId, ...searchParams }: GetContestProblemListRequest) =>
    queryOptions({
      queryKey: [
        ...contestProblemQueries.lists(contestId),
        { ...searchParams }
      ] as const,
      queryFn: () => getContestProblemList({ contestId, ...searchParams })
    })
}
