import SearchBar from '@/components/SearchBar'
import { Skeleton } from '@/components/ui/skeleton'
import type { Problem } from '@/types/type'
import { Suspense } from 'react'
import ProblemNumber from './_components/ProblemNumber'
import ProblemTable from './_components/ProblemTable'

interface ProblemProps {
  searchParams: { search: string; tag: string; order: string }
}

export default function Problem({ searchParams }: ProblemProps) {
  const search = searchParams?.search ?? ''
  const order = searchParams?.order ?? 'id-asc'

  return (
    <>
      <div className="flex justify-between text-gray-500">
        <Suspense fallback={<Skeleton className="h-8 w-20" />}>
          <ProblemNumber search={search} order={order} />
        </Suspense>
        <SearchBar />
      </div>
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
        <ProblemTable search={search} order={order} />
      </Suspense>
    </>
  )
}
