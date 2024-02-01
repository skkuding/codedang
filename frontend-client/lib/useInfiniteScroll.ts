import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { fetcher } from './utils'

interface Item {
  id: number
}

export const useInfiniteScroll = <T extends Item>(
  dataType: string,
  url: URL,
  itemsPerPage = 5 //한번에 가져올 아이템의 개수
) => {
  //fetch datas with pageParams
  const OFFSET = 0 //cursor
  const getData = async ({ pageParam = OFFSET }): Promise<T[]> => {
    const query = url.searchParams
    if (!query.has('take')) query.append('take', String(itemsPerPage))
    pageParam && pageParam > 0 && query.set('cursor', pageParam.toString())
    const data: T[] = await fetcher
      .get(dataType, {
        searchParams: query
      })
      .json()
    return data
  }

  const { data, fetchNextPage, isFetching, hasNextPage, status } =
    useInfiniteQuery({
      queryKey: [dataType],
      queryFn: getData,
      initialPageParam: 0,
      getNextPageParam: (lastPage: T[]) => {
        return lastPage?.length === 0 || lastPage?.length < itemsPerPage
          ? undefined
          : lastPage.at(-1)?.id //cursor를 getData의 params로 넘겨줍니다.
      }
    })

  const { ref, inView } = useInView()
  useEffect(() => {
    if (inView) {
      !isFetching && hasNextPage && fetchNextPage()
    }
  }, [inView, isFetching, hasNextPage, fetchNextPage])
  return { data, fetchNextPage, status, ref }
}
