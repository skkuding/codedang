'use client'

import DataTable from '@/app/(client)/(main)/_components/DataTable'
import { Skeleton } from '@/components/shadcn/skeleton'
import { useInfiniteScroll } from '@/lib/useInfiniteScroll'
import type { Problem } from '@/types/type'
import { useSearchParams } from 'next/navigation'
import SearchBar from '../../_components/SearchBar'
import { columns } from './Columns'

export default function ProblemInfiniteTable() {
  const searchParams = useSearchParams()
  const search = searchParams.get('search') ?? ''
  const order = searchParams.get('order') ?? 'id-asc'
  const newSearchParams = new URLSearchParams()
  newSearchParams.set('search', search)
  newSearchParams.set('order', order)

  const { items, total, ref, isFetchingNextPage } = useInfiniteScroll<Problem>({
    pathname: 'problem',
    query: newSearchParams
  })

  return (
    <>
      <div className="flex items-center justify-between text-gray-500">
        <div className="flex gap-1">
          <p className="text-2xl font-bold text-gray-500">All</p>
          <p className="text-2xl font-bold text-blue-500">{total}</p>
        </div>
        <SearchBar />
      </div>
      <div className="flex flex-col items-center">
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
          linked
        />
        {isFetchingNextPage && (
          <>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="my-2 flex h-12 w-full rounded-xl" />
            ))}
          </>
        )}
        <div ref={ref} />
      </div>
    </>
  )
}
