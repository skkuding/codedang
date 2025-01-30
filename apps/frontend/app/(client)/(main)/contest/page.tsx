import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Skeleton } from '@/components/shadcn/skeleton'
import { auth } from '@/libs/auth'
import { ErrorBoundary } from '@suspensive/react'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { SearchBar } from '../_components/SearchBar'
import { ContestFeatureList } from './_components/ContestFeatureList'
import { ContestMainCover } from './_components/ContestMainCover'
import { ContestMainTable } from './_components/ContestMainTable'
import { ContestSubBanner } from './_components/ContestSubBanner'
import { ContestTitleFilter } from './_components/ContestTitleFilter'

interface ContestProps {
  searchParams: {
    registered: string
    search: string
  }
}

function ContestCardListFallback() {
  return (
    <div>
      <Skeleton className="mb-8 h-8 w-24" />
      <div className="flex gap-8">
        <Skeleton className="h-[120px] w-[375px] rounded-xl" />
        <Skeleton className="h-[120px] w-[375px] rounded-xl" />
      </div>
    </div>
  )
}

function FinishedContestTableFallback() {
  return (
    <div>
      <Skeleton className="mb-8 h-8 w-24" />
      <div className="mt-4 flex">
        <span className="w-2/5 md:w-3/6">
          <Skeleton className="h-6 w-20" />
        </span>
        <span className="w-1/5 md:w-1/6">
          <Skeleton className="mx-auto h-6 w-20" />
        </span>
        <span className="w-1/5 md:w-1/6">
          <Skeleton className="mx-auto h-6 w-20" />
        </span>
        <span className="w-1/5 md:w-1/6">
          <Skeleton className="mx-auto h-6 w-20" />
        </span>
      </div>
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="my-10 flex h-8 w-full rounded-xl" />
      ))}
    </div>
  )
}

export default async function Contest({ searchParams }: ContestProps) {
  const session = await auth()
  const registered = searchParams.registered === 'true'
  if (!session && registered) {
    redirect('/contest')
  }
  const search = searchParams.search ?? ''

  return (
    <>
      <ContestMainCover />

      <ErrorBoundary fallback={FetchErrorFallback}>
        <Suspense fallback={<ContestCardListFallback />}>
          <ContestFeatureList title={`WHAT'S FUNCTION OF CONTEST?`} />
        </Suspense>
      </ErrorBoundary>

      <ContestSubBanner />

      <div className="mb-12 mt-[101px] flex w-full flex-col gap-12">
        <div className="flex-col">
          <Suspense fallback={<FinishedContestTableFallback />}>
            <ErrorBoundary fallback={FetchErrorFallback}>
              <div className="mb-11 flex justify-between">
                <h1 className="text-2xl font-semibold text-gray-700">
                  CONTEST LIST
                </h1>
                <div className="flex gap-4">
                  <SearchBar className="w-60" />
                  <ContestTitleFilter />
                </div>
              </div>
              <ContestMainTable search={search} session={session} />
            </ErrorBoundary>
          </Suspense>
        </div>
      </div>
    </>
  )
}
