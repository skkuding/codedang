import Cover from '@/app/(client)/(main)/_components/Cover'
import FetchErrorFallback from '@/components/FetchErrorFallback'
import { Skeleton } from '@/components/shadcn/skeleton'
import { auth } from '@/libs/auth'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense } from 'react'
import CourseCardList from './_components/CourseCardList'
import FinishedContestTable from './_components/FinishedAssignmentTable'

interface CourseProps {
  searchParams: {
    registered: string
    search: string
  }
}

function CourseCardListFallback() {
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

function FinishedAssignmentTableFallback() {
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

export default async function Course({ searchParams }: CourseProps) {
  const session = await auth()
  const search = searchParams.search ?? ''
  return (
    <>
      <Cover title="COURSE" description="Courses of CODEDANG" />
      <div className="flex w-full max-w-7xl flex-col gap-5 p-5 py-8">
        <ErrorBoundary fallback={FetchErrorFallback}>
          <Suspense fallback={<CourseCardListFallback />}>
            <CourseCardList
              title="This is your courses!"
              type="Ongoing"
              session={session}
            />
          </Suspense>
        </ErrorBoundary>
      </div>

      <Suspense fallback={<FinishedAssignmentTableFallback />}>
        {/* <Separator className="mb-3" /> */}
        <ErrorBoundary fallback={FetchErrorFallback}>
          <FinishedContestTable search={search} session={session} />
        </ErrorBoundary>
      </Suspense>
    </>
  )
}
