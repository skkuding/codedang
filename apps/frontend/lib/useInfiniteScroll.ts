import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import type { URLSearchParams } from 'url'
import { fetcher, fetcherWithAuth } from './utils'

interface Item {
  id: number
}

interface DataSet<T> {
  data: T[]
  total: number
}

interface UseInfiniteScrollProps {
  pathname: string
  query: URLSearchParams
  itemsPerPage?: number
  withAuth?: boolean
}

/**
 *
 * @param pathname
 * The path or endpoint from which data will be fetched.
 *
 * @param query
 * The URLSearchParams object representing the query parameters for data fetching.
 *
 * @param itemsPerPage
 * The number of items to fetch per page. Default is 5.
 *
 * @param withAuth
 * A boolean indicating whether authentication is required for data fetching. Default is false.
 *
 */

export const useInfiniteScroll = <T extends Item>({
  pathname,
  query,
  itemsPerPage = 10,
  withAuth = false
}: UseInfiniteScrollProps) => {
  //fetch datas with pageParams and url
  const getInfiniteData = async ({
    pageParam
  }: {
    pageParam?: number
  }): Promise<DataSet<T>> => {
    if (!query.has('take')) query.append('take', String(itemsPerPage))
    pageParam && pageParam > 0 && query.set('cursor', pageParam.toString())
    let dataSet: DataSet<T>
    withAuth
      ? (dataSet = await fetcherWithAuth
          .get(pathname, {
            searchParams: query
          })
          .json())
      : (dataSet = await fetcher
          .get(pathname, {
            searchParams: query
          })
          .json())
    return dataSet
  }

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery({
      queryKey: [pathname, query.toString()],
      staleTime: 0,
      queryFn: getInfiniteData,
      initialPageParam: 0,
      getNextPageParam: (lastPage: DataSet<T>) => {
        return lastPage?.data.length === 0 || //TODO: fix problem to data
          lastPage?.data.length < itemsPerPage
          ? undefined //페이지에 있는 아이템 수가 0이거나 itemsPerPage보다 작으면 undefined를 반환합니다.
          : lastPage.data.at(-1)?.id //cursor를 getData의 params로 넘겨줍니다.
      }
    })

  const { ref, inView } = useInView()

  useEffect(() => {
    if (inView && !isFetchingNextPage && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, isFetchingNextPage, hasNextPage, fetchNextPage, data])

  /*

  5번 이상 바닥에 닿으면 자동 페칭을 멈추고, loadmore 버튼을 보이게 합니다.
  const scrollCounter = useRef(0) // 바닥에 닿은 횟수를 세는 카운터
  const [isLoadButton, setIsLoadButton] = useState(false)

  useEffect(() => {
    if (inView && !isFetchingNextPage) {
      if (hasNextPage) {
        if (scrollCounter.current < 5) {
          setIsLoadButton(false)
          fetchNextPage()
          scrollCounter.current += 1
        } else {
          setIsLoadButton(true)
        }
      }
    } else setIsLoadButton(false)
  }, [inView, isFetchingNextPage, hasNextPage, fetchNextPage, data])
*/

  return {
    items: data.pages.flat().flatMap((page) => page.data),
    total: data.pages.at(0)?.total,
    fetchNextPage,
    ref,
    isFetchingNextPage
  }
}
