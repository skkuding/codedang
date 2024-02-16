import { useInfiniteQuery } from '@tanstack/react-query'
import { fetcher } from './utils'

interface Item {
  id: number
}

export const useInfiniteScroll = <T extends Item>(
  dataType: string,
  url: URL,
  itemsPerPage = 5
) => {
  //fetch datas with pageParams
  const OFFSET = 0
  const getData = async ({ pageParam = OFFSET }): Promise<T[]> => {
    const query = url.searchParams
    if (!query.has('take')) query.append('take', String(itemsPerPage + 1))
    pageParam && pageParam > 0 && query.set('cursor', pageParam.toString())
    const data: T[] = await fetcher
      .get('notice', {
        searchParams: query
      })
      .json()
    return data
  }

  const { data, fetchNextPage, status } = useInfiniteQuery({
    queryKey: [dataType],
    queryFn: getData,
    initialPageParam: 0,
    getNextPageParam: (lastPage: T[]) => {
      return lastPage?.length === 0 || lastPage?.length < itemsPerPage
        ? undefined
        : lastPage.at(-1)?.id
    }
  })
  return { data, fetchNextPage, status }
}
