import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'

interface PaginationQueryParams {
  cursor?: number
  take: number
}

interface Params {
  itemsPerPage: number
  pagesPerSlot?: number
}

/**
 * Cursor-based pagination query params custom hook.
 * Used for API request query parameter.
 * Use this hook before fetching data.
 *
 * Based on 'slot > page > item' hierarchy,
 * It needs to fetch all items in slot and 1 more to check if next slot exists.
 * Say a slot has 5 pages and a page has 10 items,
 * 51 (= 5 * 10 + 1) items should be fetched in total.
 *
 * @param itemsPerPage number of items in a page
 * @param pagesPerSlot number of pages in a slot (default: 5)
 */
export const usePaginationQueryParams = ({
  itemsPerPage,
  pagesPerSlot = 5
}: Params): [
  PaginationQueryParams,
  Dispatch<SetStateAction<PaginationQueryParams>>
] => {
  const [paginationQueryParams, setPaginationQueryParams] =
    useState<PaginationQueryParams>({
      take: itemsPerPage * pagesPerSlot + 1
    })

  return [paginationQueryParams, setPaginationQueryParams]
}

// -------------------------------------------------------------------

interface Item {
  id: number
}

interface UsePaginationParameters<T extends Item> {
  data: T[]
  itemsPerPage: number
  pagesPerSlot?: number
  takeQueryParams: number
  setPaginationQueryParams: (params: PaginationQueryParams) => void
}

/**
 * Custom Hook to get cursor-based paginated items.
 * Use this hook after fetching data.
 *
 * @param data the list of items
 * @param takeQueryParams take query parameter
 * @param itemsPerPage number of items in a page
 * @param pagesPerSlot number of pages in a slot (default: 5)
 * @param setPaginationQueryParams the function of updating pagination query params
 */
export const usePagination = <T extends Item>({
  data,
  takeQueryParams,
  itemsPerPage,
  pagesPerSlot = 5,
  setPaginationQueryParams
}: UsePaginationParameters<T>) => {
  const [page, setPage] = useState(1) // TODO: 새로고침 후에 현재 페이지로 돌아갈 수 있도록 수정
  const [slot, setSlot] = useState(0)
  const firstPage = slot * pagesPerSlot + 1

  const [slotItems, setSlotItems] = useState(
    getSlotItems(data, takeQueryParams)
  )
  const startIndex = ((page - firstPage) % pagesPerSlot) * itemsPerPage
  const paginatedItems = slotItems.slice(startIndex, startIndex + itemsPerPage)
  const pageCount = Math.min(
    Math.ceil(slotItems.length / itemsPerPage),
    pagesPerSlot
  )

  useEffect(() => {
    setSlotItems(getSlotItems(data, takeQueryParams))
  }, [data, takeQueryParams])

  // handle in-slot navigation
  const gotoPage = (newPage: number) => {
    setPage(newPage)
  }

  // handle across-slot navigation
  const gotoSlot = (direction: 'prev' | 'next') => {
    const newPage = direction === 'prev' ? firstPage - 1 : firstPage + pageCount
    setPage(newPage)
    setSlot(Math.floor((newPage - 1) / pagesPerSlot))

    const firstData = slotItems.at(0)
    const lastData = slotItems.at(-1)

    if (direction === 'prev') {
      setPaginationQueryParams({
        cursor: firstData?.id,
        take: -Math.abs(takeQueryParams)
      })
    }

    if (direction === 'next') {
      setPaginationQueryParams({
        cursor: lastData?.id,
        take: Math.abs(takeQueryParams)
      })
    }
  }

  return {
    paginatedItems,
    firstPage,
    lastPage: firstPage + pageCount - 1,
    currentPage: page,
    gotoPage,
    gotoSlot
  }
}

const getSlotItems = <T extends Item>(data: T[], take: number) => {
  const next = take > 0
  const full = data.length >= Math.abs(take)

  let newItems = data

  if (full) {
    if (next) {
      newItems = data.slice(0, data.length - 1)
    } else {
      newItems = data.slice(1)
    }
  }

  return newItems
}
