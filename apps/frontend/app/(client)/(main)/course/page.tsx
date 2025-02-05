import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Separator } from '@/components/shadcn/separator'
import { Skeleton } from '@/components/shadcn/skeleton'
import { auth } from '@/libs/auth'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense } from 'react'
import { CourseCardList } from './_components/CourseCardList'
import { Cover } from './_components/Cover'
import { Dashboard } from './_components/Dashboard'

function CardListFallback() {
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

export default async function Course() {
  const session = await auth()
  return (
    <>
      <Cover
        title="COURSE"
        welcomeText="NICE TO SEE YOU"
        mainText="COURSE HUB"
        buttonText="CHECK YOUR COURSE"
      />
      <div className="flex w-full max-w-7xl flex-col gap-5 p-5 py-8">
        <ErrorBoundary fallback={FetchErrorFallback}>
          <Suspense fallback={<CardListFallback />}>
            <CourseCardList
              title="MY COURSE"
              type="Ongoing"
              session={session}
            />
          </Suspense>
        </ErrorBoundary>
        <Separator className="my-4" />
        <div className="flex">
          <h1 className="font-sans text-2xl font-semibold text-gray-700">
            COURSE OVERVIEW
          </h1>
        </div>
      </div>
      <div className="w-full">
        <Dashboard session={session} />
      </div>
    </>
  )
}
