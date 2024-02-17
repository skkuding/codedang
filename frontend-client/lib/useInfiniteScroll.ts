import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { fetcher, fetcherWithAuth } from './utils'

interface Item {
  id: number
  status: string
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
  dataType: string,
  url: URL, //url 목록
  itemsPerPage = 3 //한번에 가져올 아이템의 개수
) => {
  const [items, setItems] = useState<T[]>([]) //T[] 형태로 return 해야 함
  //fetch datas with pageParams and url
  const getInfiniteData = async ({
    pageParam
  }: {
    pageParam?: number
  }): Promise<T[]> => {
    const query = url.searchParams
    if (!query.has('take')) query.append('take', String(itemsPerPage))
    pageParam && pageParam > 0 && query.set('cursor', pageParam.toString())
    if (dataType === 'problem') {
      const data: { problems: T[] } = await fetcher
        .get('problem', {
          searchParams: query
        })
        .json()
      return data.problems
    }
    if (dataType === 'contest') {
      const data: T[] = await fetcherWithAuth
        .get('contest/registered-finished', {
          searchParams: query
        })
        .json()
      data.forEach((contest) => {
        contest.status = 'finished'
      })
      return data
    }
    const data: T[] = await fetcher
      .get(dataType, {
        searchParams: query
      })
      .json()
    return data
  }

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: [dataType, url],
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
    if (data && data.pages && data.pages.length > 0) {
      const allItems: T[] = []
      data.pages.forEach((page) => {
        allItems.push(...page)
      })
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
  }, [inView, isFetchingNextPage, hasNextPage, fetchNextPage, url])

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
