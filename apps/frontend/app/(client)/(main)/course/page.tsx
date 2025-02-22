import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Separator } from '@/components/shadcn/separator'
import { Skeleton } from '@/components/shadcn/skeleton'
import { auth } from '@/libs/auth'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense } from 'react'
import { CourseCardList } from './_components/CourseCardList'
import { CourseMainBanner } from './_components/CourseMainBanner'

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

  if (!session) {
    return (
      <>
        <CourseMainBanner course={null} />
        <div className="flex w-full max-w-7xl flex-col items-center justify-center p-5 py-8">
          <h2 className="text-xl font-semibold text-gray-700">
            Please Login First
          </h2>
          <p className="mt-2 text-gray-500">
            You need to login to view your courses.
          </p>
        </div>
      </>
    )
  }

  return (
    <>
      <CourseMainBanner course={null} />
      <div className="flex w-full max-w-7xl flex-col gap-5 p-5 py-8">
        <ErrorBoundary fallback={FetchErrorFallback}>
          <Suspense fallback={<CardListFallback />}>
            <CourseCardList title="MY COURSE" />
          </Suspense>
        </ErrorBoundary>
        <Separator className="my-4" />
      </div>
    </>
  )
}
