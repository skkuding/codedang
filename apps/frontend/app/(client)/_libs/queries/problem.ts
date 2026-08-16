import { queryOptions } from '@tanstack/react-query'
import { getProblemList, type GetProblemListRequest } from '../apis/problem'
import { getInfiniteQueryOptions } from './infiniteQuery'

export const problemQueries = {
  all: () => ['problem'] as const,
  lists: () => [...problemQueries.all(), 'list'] as const,
  list: (params: GetProblemListRequest) =>
    queryOptions({
      queryKey: [...problemQueries.lists(), params] as const,
      queryFn: () => getProblemList(params)
    }),
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
