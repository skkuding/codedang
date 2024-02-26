import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import type { URLSearchParams } from 'url'
import { fetcher, fetcherWithAuth } from './utils'

interface Item {
  id: number
}

/**
 *
 * @param dataType
 *  The type of data being fetched.
 * @param url
 * The URL for fetching the data.
 * @param itemsPerPage
 * The number of items to fetch per page.
 */

export const useInfiniteScroll = <T extends Item>(
  pathname: string,
  query: URLSearchParams,
  itemsPerPage = 10,
  withAuth = false
) => {
  const [items, setItems] = useState<T[]>([]) //T[] 형태로 return 해야 함
  //fetch datas with pageParams and url
  const getInfiniteData = async ({
    pageParam
  }: {
    pageParam?: number
  }): Promise<T[]> => {
    if (!query.has('take')) query.append('take', String(itemsPerPage))
    pageParam && pageParam > 0 && query.set('cursor', pageParam.toString())

    let data: T[]
    withAuth
      ? (data = await fetcherWithAuth
          .get(pathname, {
            searchParams: query
          })
          .json())
      : (data = await fetcher
          .get(pathname, {
            searchParams: query
          })
          .json())

    return data
  }

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: [pathname, pathname, query],
      queryFn: getInfiniteData,
      initialPageParam: 0,
      getNextPageParam: (lastPage: T[]) => {
        return lastPage?.length === 0 || lastPage?.length < itemsPerPage
          ? undefined //페이지에 있는 아이템 수가 0이거나 itemsPerPage보다 작으면 undefined를 반환합니다.
          : lastPage.at(-1)?.id //cursor를 getData의 params로 넘겨줍니다.
      }
    })

  //data가 T[][] 형태이므로 T[]로 가공
  useEffect(() => {
    if (data?.pages?.length) {
      const allItems: T[] = data.pages.flat()
      setItems(allItems)
    }
  }, [data])

  //To detect the bottom div
  const scrollCounter = useRef(0) // 바닥에 닿은 횟수를 세는 카운터
  const { ref, inView } = useInView()
  useEffect(() => {
    if (inView && !isFetchingNextPage && hasNextPage) {
      if (scrollCounter.current < 5) {
        fetchNextPage()
        scrollCounter.current += 1
      }
    }
  }, [inView, isFetchingNextPage, hasNextPage, fetchNextPage, pathname, query])

  return {
    items,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    ref,
    scrollCounter,
    isLoading
  }
}
