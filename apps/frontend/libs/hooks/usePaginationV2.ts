import { useState, type Dispatch, type SetStateAction } from 'react'

interface PaginationQueryParams {
  cursor?: number
  take: number
}

interface Item {
  id: number
}

interface Params<T extends Item> {
  data: T[]
  totalCount: number
  itemsPerPage: number
  pagesPerSlot?: number
  updateQueryParams?: Dispatch<SetStateAction<PaginationQueryParams>>
}

const DEFAULT_PAGES_PER_SLOT = 5
/**
 * Custom Hook for cursor-based pagination without 'take' query.
 * Use this hook after fetching data.
 *
 * @param data the list of (filtered or not) items
 * @param totalCount the total count of data
 * @param itemsPerPage number of items in a page
 * @param pagesPerSlot number of pages in a slot (default: 10)
 * @param updateQueryParams the function of updating pagination query params
 */
export const usePagination = <T extends Item>({
  data,
  itemsPerPage,
  totalCount,
  pagesPerSlot = DEFAULT_PAGES_PER_SLOT,
  updateQueryParams
}: Params<T>) => {
  const [page, setPage] = useState(1)
  const [slot, setSlot] = useState(0)

  const firstPage = slot * pagesPerSlot + 1
  const pageCount = Math.min(
    Math.ceil(totalCount / itemsPerPage) - slot * pagesPerSlot,
    pagesPerSlot
  )
  const lastPage = firstPage + pageCount - 1

  const startIndex = ((page - firstPage) % pagesPerSlot) * itemsPerPage
  const paginatedItems = data.slice(startIndex, startIndex + itemsPerPage)

  // handle in-slot navigation
  const gotoPage = (newPage: number) => {
    setPage(newPage)
  }

  // handle across-slot navigation
  const gotoSlot = (direction: 'prev' | 'next') => {
    const newPage = direction === 'prev' ? page - 1 : page + 1
    setPage(newPage)
    setSlot(Math.floor((newPage - 1) / pagesPerSlot))

    if (updateQueryParams) {
      if (direction === 'prev') {
        updateQueryParams(({ take }) => ({
          cursor: data.at(0)?.id,
          take: -Math.abs(take ?? 0)
        }))
      }
      if (direction === 'next') {
        updateQueryParams(({ take }) => ({
          cursor: data.at(-1)?.id,
          take: Math.abs(take ?? 0)
        }))
      }
    }
  }

  return {
    paginatedItems,
    firstPage,
    lastPage,
    currentPage: page,
    prevDisabled: page <= 1,
    nextDisabled: page * itemsPerPage >= totalCount,
    gotoPage,
    gotoSlot
  }
}

export const getTakeQueryParam = ({
  itemsPerPage,
  pagesPerSlot = DEFAULT_PAGES_PER_SLOT
}: {
  itemsPerPage: number
  pagesPerSlot?: number
}) => {
  return itemsPerPage * pagesPerSlot
}
