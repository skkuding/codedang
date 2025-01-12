import FetchErrorFallback from '@/components/FetchErrorFallback'
import { Skeleton } from '@/components/shadcn/skeleton'
import type { Notice } from '@/types/type'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense } from 'react'
import SearchBar from '../_components/SearchBar'
import NoticeTable from './_components/NoticeTable'

interface NoticeProps {
  searchParams: { search: string }
}

export default function Notice({ searchParams }: NoticeProps) {
  const search = searchParams.search ?? ''

  return (
    <>
      <div className="flex w-full justify-end">
        <SearchBar />
      </div>
      <ErrorBoundary fallback={FetchErrorFallback}>
        <Suspense
          fallback={
            <>
              <div className="mt-4 flex">
                <span className="w-2/4 md:w-4/6">
                  <Skeleton className="h-6 w-20" />
                </span>
                <span className="w-1/4 md:w-1/6">
                  <Skeleton className="mx-auto h-6 w-20" />
                </span>
                <span className="w-1/4 md:w-1/6">
                  <Skeleton className="mx-auto h-6 w-20" />
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
          <NoticeTable search={search} />
        </Suspense>
      </ErrorBoundary>
    </>
  )
}
