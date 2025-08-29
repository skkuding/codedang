import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Skeleton } from '@/components/shadcn/skeleton'
import { auth } from '@/libs/auth'
import { fetcherWithAuth } from '@/libs/utils'
import welcomeLogo from '@/public/logos/welcome.png'
import type { ContestTop, ProblemDataTop } from '@/types/type'
import { ErrorBoundary } from '@suspensive/react'
import Image from 'next/image'
import { Suspense } from 'react'
import { LoginButton } from './_components/LoginButton'
import { QnAMainTable } from './_components/QnAMainTable'

interface ContestQnAProps {
  params: Promise<{ contestId: number }>
  searchParams: Promise<{
    registered: string
    search: string
    orderBy: string
    categories: string
    problemOrders: string
  }>
}

export default async function ContestQna(props: ContestQnAProps) {
  const { contestId } = await props.params
  const { searchParams } = props

  const session = await auth()
  const params = await searchParams
  const search = params.search ?? ''
  const orderBy = params.orderBy ?? 'desc'
  const categories = params.categories ?? ''
  const problemOrders = params.problemOrders ?? ''

  const contest: ContestTop = await fetcherWithAuth
    .get(`contest/${contestId}`)
    .json()
  const contestProblems: ProblemDataTop = await fetcherWithAuth
    .get(`contest/${contestId}/problem`)
    .json()

  const state = (() => {
    const currentTime = new Date()
    const contestStart = new Date(contest.startTime)
    const contestEnd = new Date(contest.endTime)
    if (currentTime >= contestStart && currentTime < contestEnd) {
      return 'Ongoing'
    }
  })()

  const canCreateQnA =
    session &&
    (contest.isRegistered || contest.isPrivilegedRole || state !== 'Ongoing')
  const isPrivilegedRole = contest.isPrivilegedRole

  if (!session && state === 'Ongoing') {
    return (
      <div className="flex w-full max-w-7xl flex-col items-center justify-center p-5 py-48">
        <Image src={welcomeLogo} alt="welcome" />
        <p className="mt-10 text-2xl font-semibold">Please Login!</p>
        <div className="mt-2 text-center text-base font-normal text-[#7F7F7F]">
          <p>This page is only available to logged-in users.</p>
          <p>Click the button below to login.</p>
        </div>
        <LoginButton className="mt-6 flex h-[46px] w-60 items-center justify-center text-base font-bold" />
        <div className="py-5" />
      </div>
    )
  }

  return (
    <div className="mb-[88px] mt-[80px] max-w-[1440px] px-[116px]">
      <ErrorBoundary fallback={FetchErrorFallback}>
        <Suspense fallback={<QnATableFallback />}>
          <QnAMainTable
            session={session}
            contestId={contestId}
            contestProblems={contestProblems}
            search={search}
            orderBy={orderBy}
            categories={categories}
            problemOrders={problemOrders}
            isPrivilegedRole={isPrivilegedRole}
            canCreateQnA={canCreateQnA}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}

function QnATableFallback() {
  return (
    <div className="w-[1208px]">
      <Skeleton className="h-[34px] w-[235px] gap-4" />
      <div className="mt-[148px] flex">
        <span className="w-1/12">
          <Skeleton className="h-6 w-20" />
        </span>
        <span className="w-2/12">
          <Skeleton className="mx-auto h-6 w-20" />
        </span>
        <span className="w-5/12">
          <Skeleton className="mx-auto h-6 w-20" />
        </span>
        <span className="w-2/12">
          <Skeleton className="mx-auto h-6 w-20" />
        </span>
        <span className="w-2/12">
          <Skeleton className="mx-auto h-6 w-20" />
        </span>
      </div>
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="my-10 flex h-8 w-full rounded-xl" />
      ))}
    </div>
  )
}
