import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Skeleton } from '@/components/shadcn/skeleton'
import { auth } from '@/libs/auth'
import { ErrorBoundary } from '@suspensive/react'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { ContestHeader } from './_components/ContestHeader'
import { ContestMainTable } from './_components/ContestMainTable'

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
    <div className="flex w-full max-w-[1440px] flex-col sm:px-6 md:px-[116px]">
      <ContestHeader />
      <div className="mb-12 flex w-full flex-col gap-12">
        <div className="flex-col">
          <ErrorBoundary fallback={FetchErrorFallback}>
            <Suspense fallback={<FinishedContestTableFallback />}>
              <ContestMainTable search={search} session={session} />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  )
}

function FinishedContestTableFallback() {
  return (
    <div>
      <Skeleton className="mb-12 h-12 w-[196px]" />
      <div className="flex">
        <span className="w-2/5 md:w-3/6">
          <Skeleton className="h-7 w-20" />
        </span>
        <span className="w-1/5 md:w-1/6">
          <Skeleton className="mx-auto h-7 w-20" />
        </span>
        <span className="w-1/5 md:w-1/6">
          <Skeleton className="mx-auto h-7 w-20" />
        </span>
        <span className="w-1/5 md:w-1/6">
          <Skeleton className="mx-auto h-7 w-20" />
        </span>
      </div>
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="my-10 flex h-8 w-full rounded-xl" />
      ))}
    </div>
  )
}
