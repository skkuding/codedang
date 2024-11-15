'use client'

import { Skeleton } from '@/components/shadcn/skeleton'
import type { Problem } from '@/types/type'
import { Suspense } from 'react'
import ProblemInfiniteTable from './_components/ProblemInfiniteTable'

export default function Problem() {
  return (
    <Suspense
      fallback={
        <>
          <div className="mt-4 flex">
            <span className="w-5/12">
              <Skeleton className="h-6 w-20" />
            </span>
            <span className="w-2/12">
              <Skeleton className="mx-auto h-6 w-20" />
            </span>
            <span className="w-2/12">
              <Skeleton className="mx-auto h-6 w-20" />
            </span>
            <span className="w-2/12">
              <Skeleton className="mx-auto h-6 w-20" />
            </span>
            <span className="w-1/12">
              <Skeleton className="mx-auto h-6 w-12" />
            </span>
          </div>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="my-2 flex h-12 w-full rounded-xl" />
          ))}
        </>
      }
    >
      <ProblemInfiniteTable />
    </Suspense>
  )
}
