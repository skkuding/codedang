import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { fetcher } from './utils'

interface Item {
  id: number
}
/**
 * A custom hook for implementing infinite scrolling functionality.
 *
 * @template T - The type of items being fetched.
 * @param dataType - The type of data being fetched.
 * @param url - The URL for fetching the data.
 * @param itemsPerPage - The number of items to fetch per page.
 * @example
 * ```ts
 * const { items, fetchNextPage, isFetchingNextPage, ref } = useInfiniteScroll<ItemType>('dataType', new URL('http://example.com/api'), 10);
 * ```
 */

export const useInfiniteScroll = <T extends Item>(
  dataType: string,
  url: URL,
  itemsPerPage: 10
) => {
  const [items, setItems] = useState<T[]>([])
  //fetch datas with pageParams and url
  const getInfiniteData = async ({
    pageParam
  }: {
    pageParam?: number
  }): Promise<T[]> => {
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

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
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
  const { ref, inView } = useInView()
  useEffect(() => {
    if (inView && !isFetchingNextPage && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, isFetchingNextPage, hasNextPage, fetchNextPage, url])

  return { items, fetchNextPage, isFetchingNextPage, ref }
}
