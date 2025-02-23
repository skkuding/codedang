import { getProblemList, type GetProblemListRequest } from '../apis/problem'
import { getInfiniteQueryOptions } from './infiniteQuery'

export const problemQueries = {
  all: () => ['problem'] as const,
  infiniteList: (params: GetProblemListRequest) =>
    getInfiniteQueryOptions({
      queryKey: [...problemQueries.all(), 'list', params] as const,
      queryFn: ({ pageParam }) =>
        getProblemList({
          ...params,
          ...(pageParam ? { cursor: pageParam } : undefined)
        }),
      itemsPerPage: params.take
    })
}
