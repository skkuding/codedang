'use client'

import { Skeleton } from '@/components/ui/skeleton'
import type { Problem } from '@/types/type'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { Suspense } from 'react'
import ProblemInfiniteTable from './_components/ProblemInfiniteTable'

export default function Problem() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000
      }
    }
  })
  return (
    <>
      <QueryClientProvider client={queryClient}>
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
                <Skeleton
                  key={i}
                  className="my-2 flex h-12 w-full rounded-xl"
                />
              ))}
            </>
          }
        >
          <ProblemInfiniteTable />
        </Suspense>
      </QueryClientProvider>
    </>
  )
}
