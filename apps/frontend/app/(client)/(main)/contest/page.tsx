import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Skeleton } from '@/components/shadcn/skeleton'
import { auth } from '@/libs/auth'
import { ErrorBoundary } from '@suspensive/react'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { ContestFeatureList } from './_components/ContestFeatureList'
import { ContestMainBanner } from './_components/ContestMainBanner'
import { ContestMainTable } from './_components/ContestMainTable'
import { ContestSubBanner } from './_components/ContestSubBanner'

interface ContestProps {
  searchParams: Promise<{
    registered: string
    search: string
  }>
}

export default async function Contest(props: ContestProps) {
  const searchParams = await props.searchParams
  const session = await auth()
  const registered = searchParams.registered === 'true'
  if (!session && registered) {
    redirect('/contest')
  }
  const search = searchParams.search ?? ''

  return (
    <>
      <ContestMainBanner />

      <ErrorBoundary fallback={FetchErrorFallback}>
        <Suspense fallback={<ContestCardListFallback />}>
          <ContestFeatureList title={`WHAT'S FUNCTION OF CONTEST?`} />
        </Suspense>
      </ErrorBoundary>

      <ContestSubBanner />

      <div className="mb-12 mt-[101px] flex w-full max-w-[1440px] flex-col gap-12 px-[116px]">
        <div className="flex-col">
          <ErrorBoundary fallback={FetchErrorFallback}>
            <Suspense fallback={<FinishedContestTableFallback />}>
              <ContestMainTable search={search} session={session} />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </>
  )
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
