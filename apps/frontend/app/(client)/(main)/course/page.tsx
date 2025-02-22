import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Separator } from '@/components/shadcn/separator'
import { Skeleton } from '@/components/shadcn/skeleton'
import { auth } from '@/libs/auth'
import { fetcherWithAuth } from '@/libs/utils'
import type { JoinedCourse } from '@/types/type'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense } from 'react'
import { CourseCardList } from './_components/CourseCardList'
import { CourseMainBanner } from './_components/CourseMainBanner'
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

  const joinedCourses = await fetcherWithAuth
    .get('course/joined')
    .json<JoinedCourse[]>()

  return (
    <>
      <CourseMainBanner />
      <div className="flex w-full max-w-7xl flex-col gap-5 p-5 py-8">
        <ErrorBoundary fallback={FetchErrorFallback}>
          <Suspense fallback={<CardListFallback />}>
            <CourseCardList
              title="MY COURSE"
              session={session}
              courses={joinedCourses}
            />
          </Suspense>
        </ErrorBoundary>
        <Separator className="my-4" />
      </div>
    </>
  )
}
