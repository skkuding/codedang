import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { fetcher } from './utils'

interface Item {
  id: number
}

export const useInfiniteScroll = <T extends Item>(
  dataType: string,
  url: URL,
  itemsPerPage = 10 //한번에 가져올 아이템의 개수
) => {
  const [items, setItems] = useState<T[]>([])
  //fetch datas with pageParams
  const OFFSET = 0 //cursor
  const getInfiniteData = async ({ pageParam = OFFSET }): Promise<T[]> => {
    const query = url.searchParams
    if (!query.has('take')) query.append('take', String(itemsPerPage))
    pageParam && pageParam > 0 && query.set('cursor', pageParam.toString())
    const data: T[] = await fetcher
      .get(dataType, {
        searchParams: query
      })
      .json()
    console.log(query.toString())
    return data
  }

  const { data, fetchNextPage, isFetching, hasNextPage, status } =
    useInfiniteQuery({
      queryKey: [dataType, url],
      queryFn: getInfiniteData,
      initialPageParam: 0,
      getNextPageParam: (lastPage: T[]) => {
        return lastPage?.length === 0 || lastPage?.length < itemsPerPage
          ? undefined
          : lastPage.at(-1)?.id //cursor를 getData의 params로 넘겨줍니다.
      }
    })

  //data가 T[][] 형태이므로 필요한 형태로 가공
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
    if (inView) {
      !isFetching && hasNextPage && fetchNextPage()
    }
  }, [inView, isFetching, hasNextPage, fetchNextPage])

  return { items, fetchNextPage, status, ref }
}
