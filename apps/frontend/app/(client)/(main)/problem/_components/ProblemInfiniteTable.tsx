'use client'

import { DataTable } from '@/app/(client)/(main)/_components/DataTable'
import { problemQueries } from '@/app/(client)/_libs/queries/problem'
import { IntersectionArea } from '@/components/IntersectionArea'
import { Skeleton } from '@/components/shadcn/skeleton'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { SearchBar } from '../../_components/SearchBar'
import { columns } from './Columns'

export function ProblemInfiniteTable() {
  const searchParams = useSearchParams()
  const search = searchParams.get('search') ?? ''
  const order = searchParams.get('order') ?? 'id-asc'

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(problemQueries.infiniteList({ search, order }))

  return (
    <>
      <div className="flex items-center justify-between text-gray-500">
        <div className="flex gap-1">
          <p className="text-2xl font-bold text-gray-500">All</p>
          <p className="text-2xl font-bold text-blue-500">{data.total}</p>
        </div>
        <SearchBar />
      </div>
      <div className="flex flex-col items-center">
        <IntersectionArea
          disabled={!hasNextPage || isFetchingNextPage}
          onIntersect={fetchNextPage}
        >
          <DataTable
            data={data.items}
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
          {isFetchingNextPage &&
            [...Array(5)].map((_, i) => (
              <Skeleton key={i} className="my-2 flex h-12 w-full rounded-xl" />
            ))}
        </IntersectionArea>
      </div>
    </>
  )
}

export function ProblemInfiniteTableFallback() {
  return (
    <>
      <div className="mt-4 flex">
        <span className="w-5/12">
          <Skeleton className="h-6 w-20" />
        </span>
      </div>
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="my-2 flex h-12 w-full rounded-xl" />
      ))}
    </>
  )
}
