import {
  infiniteQueryOptions,
  type QueryKey,
  type UnusedSkipTokenInfiniteOptions
} from '@tanstack/react-query'

interface Item {
  id: number
}

interface DataSet<T extends Item> {
  data: T[]
  total: number
}

type PageParam = number | undefined

interface GetInfiniteQueryOptionsParams<T extends Item, K extends QueryKey>
  extends Partial<
    UnusedSkipTokenInfiniteOptions<DataSet<T>, Error, DataSet<T>, K, PageParam>
  > {
  queryKey: K
  itemsPerPage?: number
}

export const getInfiniteQueryOptions = <T extends Item, K extends QueryKey>({
  queryFn,
  queryKey,
  itemsPerPage = 10
}: GetInfiniteQueryOptionsParams<T, K>) => {
  return infiniteQueryOptions({
    queryKey,
    queryFn,
    staleTime: 0,
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.data.length === 0 || lastPage.data.length < itemsPerPage
        ? undefined //페이지에 있는 아이템 수가 0이거나 itemsPerPage보다 작으면 undefined를 반환합니다.
        : lastPage.data.at(-1)?.id //cursor를 getData의 params로 넘겨줍니다.
    },
    select: (data) => {
      const items = data.pages.flat().flatMap((page) => page.data)
      const total = data.pages.at(0)?.total

      return { items, total }
    }
  })
}
