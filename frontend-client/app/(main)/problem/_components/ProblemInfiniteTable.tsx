'use client'

import DataTable from '@/components/DataTable'
import SearchBar from '@/components/SearchBar'
import { Button } from '@/components/ui/button'
import { useInfiniteScroll } from '@/lib/useInfiniteScroll'
import { fetcher } from '@/lib/utils'
import { baseUrl } from '@/lib/vars'
import type { Problem } from '@/types/type'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import ClipLoader from 'react-spinners/ClipLoader'
import { columns } from './Columns'

const getProblemTotal = async (search: string) => {
  const data: { total: number } = await fetcher
    .get('problem', {
      searchParams: {
        take: 0,
        search
      }
    })
    .json()
  return data.total
}

export default function ProblemInfiniteTable() {
  const searchParam = useSearchParams()
  const search = searchParam.get('search') ?? ''
  const order = searchParam.get('order') ?? 'id-asc'
  const url = new URL('/problem', baseUrl)
  if (search) {
    url.searchParams.set('search', search)
  }
  if (order) {
    url.searchParams.set('order', order)
  }
  const {
    items,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    ref,
    scrollCounter
  } = useInfiniteScroll<Problem>('problem', url)

  const [problemTotal, setProblemTotal] = useState(0)
  useEffect(() => {
    const fetchTotal = async () => {
      const total = await getProblemTotal(search)
      setProblemTotal(total)
    }
    fetchTotal()
  }, [search])

  return (
    <>
      <div className="flex items-center justify-between text-gray-500">
        <div className="flex gap-1">
          <p className="text-2xl font-bold text-gray-500">All</p>
          <p className="text-2xl font-bold text-blue-500">{problemTotal}</p>
        </div>
        <SearchBar />
      </div>
      <div className="flex flex-col items-center">
        {isLoading ? (
          <ClipLoader />
        ) : (
          <DataTable
            data={items}
            columns={columns}
            headerStyle={{
              title: 'text-left w-5/12',
              difficulty: 'w-2/12',
              submissionCount: 'w-2/12',
              acceptedRate: 'w-2/12',
              info: 'w-1/12'
            }}
            name="problem"
          />
        )}

        {isFetchingNextPage && hasNextPage && <ClipLoader />}
        {!isFetchingNextPage && hasNextPage && scrollCounter.current >= 5 && (
          <Button onClick={() => fetchNextPage()} className="w-40">
            Load More
          </Button>
        )}
        <div ref={ref} />
      </div>
    </>
  )
}
