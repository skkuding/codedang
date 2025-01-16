import Cover from '@/app/(client)/(main)/_components/Cover'
import FetchErrorFallback from '@/components/FetchErrorFallback'
import { Skeleton } from '@/components/shadcn/skeleton'
import { auth } from '@/libs/auth'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense } from 'react'
import CourseCardList from './_components/CourseCardList'

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
      <Cover title="COURSE" description="Courses of CODEDANG" />
      <div className="flex w-full max-w-7xl flex-col gap-5 p-5 py-8">
        <ErrorBoundary fallback={FetchErrorFallback}>
          <Suspense fallback={<CardListFallback />}>
            <CourseCardList title="My Class" type="Ongoing" session={session} />
          </Suspense>
        </ErrorBoundary>
      </div>
    </>
  )
}
