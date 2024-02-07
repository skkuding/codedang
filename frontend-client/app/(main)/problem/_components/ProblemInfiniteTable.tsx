'use client'

import DataTable from '@/components/DataTable'
import { Button } from '@/components/ui/button'
import { useInfiniteScroll } from '@/lib/useInfiniteScroll'
import { baseUrl } from '@/lib/vars'
import type { Problem } from '@/types/type'
import { useSearchParams } from 'next/navigation'
import ClipLoader from 'react-spinners/ClipLoader'
import { columns } from './Columns'

export default function ProblemInfiniteTable() {
  const searchParam = useSearchParams()
  const search = searchParam.get('search')
  const order = searchParam.get('order')
  const url = new URL('/problem', baseUrl)
  if (search) {
    url.searchParams.set('search', search)
  }
  if (order) {
    url.searchParams.set('order', order)
  }

  const {
    items,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    ref,
    scrollCounter
  } = useInfiniteScroll<Problem>('problem', url)

  return (
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
  )
}
