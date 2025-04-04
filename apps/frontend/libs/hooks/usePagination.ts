import { fetcher, fetcherWithAuth } from '@/libs/utils'
import { useEffect, useState, useRef, useCallback } from 'react'

interface Item {
  id: number
}

interface DataSet<T> {
  data: T[]
  total: number
}

/**
 * Custom Hook to get cursor-based paginated items.
 *
 * Based on 'slot > page > item' hierarchy,
 * it fetches all items in slot and 1 more to check if next slot exists.
 * Say a slot has 5 pages and a page has 10 items,
 * 51 (= 5 * 10 + 1) items should be fetched in total.
 *
 * If returned `items` is undefined, it means fetching is not completed.
 * After completion, it will automatically re-render calling component.
 * For page navigation within slot, call `paginator.page.goto(${page})`.
 * For slot navigation, call `paginator.slot.goto(${slot}, setPath)`.
 *
 * @param url initial url to fetch
 * @param itemsPerPage number of items in a page
 * @param pagesPerSlot number of pages in a slot
 */
export const usePagination = <T extends Item>(
  url: string,
  itemsPerPage = 10,
  pagesPerSlot = 5,
  withauth = false
) => {
  const [items, setItems] = useState<T[]>()
  const slotItems = useRef<DataSet<T>>({ data: [], total: 0 })

  const page = useRef(1) // TODO: 새로고침 후에 현재 페이지로 돌아갈 수 있도록 수정
  const slot = useRef(0)
  const nav = useRef({
    page: {
      first: 0,
      count: 0
    },
    slot: {
      prev: '',
      next: ''
    }
  })

  // parse path and base query from given url
  const take = itemsPerPage * pagesPerSlot + 1
  const [path, baseQuery] = url.split('?')
  const [query, setQuery] = useState(
    new URLSearchParams(`${baseQuery}&take=${take}`)
  )

  // handle in-slot navigation
  const gotoPage = useCallback(
    (newPage: number) => {
      page.current = newPage
      const start =
        ((newPage - nav.current.page.first) % pagesPerSlot) * itemsPerPage
      setItems(slotItems.current.data?.slice(start, start + itemsPerPage))
    },
    [itemsPerPage, pagesPerSlot]
  )

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })

  // handle across-slot navigation
  const gotoSlot = (direction: 'prev' | 'next') => {
    page.current =
      direction === 'prev'
        ? nav.current.page.first - 1
        : nav.current.page.first + nav.current.page.count
    slot.current = Math.floor((page.current - 1) / pagesPerSlot)

    // trigger useEffect hook
    setQuery(new URLSearchParams(nav.current.slot[direction]))
  }

  useEffect(() => {
    ;(async () => {
      // TODO: fetcher <-> fetcherWithAuth 중 선택할 수 있도록 수정
      const res = withauth
        ? await fetcherWithAuth.get(path, {
            searchParams: query
          })
        : await fetcher.get(path, {
            searchParams: query
          })
      console.log(res.status)
      const resData: DataSet<T> = await res.json()

      const next = Number(query.get('take')) > 0
      const full = resData.data?.length >= take
      if (full) {
        if (next) {
          resData.data.pop()
        } else {
          resData.data.shift()
        }
      }

      const firstData = resData.data.at(0)
      const lastData = resData.data.at(-1)

      nav.current = {
        page: {
          first: slot.current * pagesPerSlot + 1,
          count: Math.min(
            Math.ceil(resData.data?.length / itemsPerPage),
            pagesPerSlot
          )
        },
        slot: {
          prev:
            ((next && slot.current > 0) || (!next && full)) && firstData
              ? `${baseQuery}&cursor=${firstData.id}&take=${-take}`
              : '',
          next:
            ((next && full) || !next) && lastData
              ? `${baseQuery}&cursor=${lastData.id}&take=${take}`
              : ''
        }
      }
      slotItems.current = resData
      gotoPage(page.current)
    })()
  }, [query, path, baseQuery, itemsPerPage, pagesPerSlot, take, gotoPage])

  return {
    items,
    paginator: {
      page: { ...nav.current.page, current: page.current, goto: gotoPage },
      slot: { ...nav.current.slot, goto: gotoSlot }
    }
  }
}
