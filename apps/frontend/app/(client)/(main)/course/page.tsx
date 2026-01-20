import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Skeleton } from '@/components/shadcn/skeleton'
import { auth } from '@/libs/auth'
import { safeFetcherWithAuth } from '@/libs/utils'
import welcomeLogo from '@/public/logos/welcome.png'
import type { JoinedCourse } from '@/types/type'
import { ErrorBoundary } from '@suspensive/react'
import Image from 'next/image'
import { Suspense } from 'react'
import { CourseCardList } from './_components/CourseCardList'
import { CourseMainBanner } from './_components/CourseMainBanner'
import { CourseSubBanner } from './_components/CourseSubBanner'
import { Dashboard } from './_components/Dashboard'
import { LoginButton } from './_components/LoginButton'

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

async function getJoinedCourses(): Promise<JoinedCourse[]> {
  try {
    const res = await safeFetcherWithAuth.get('course/joined', {
      searchParams: { take: 100 }
    })

    if (res.ok) {
      const json = await res.json()
      return Array.isArray(json) ? (json as JoinedCourse[]) : []
    }
  } catch (error) {
    console.error('fail to load courses.', error)
  }
  return []
}

export default async function Course() {
  const session = await auth()
  if (!session) {
    return (
      <>
        <CourseMainBanner course={null} />
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
      </>
    )
  }

  const joinedCourses = await getJoinedCourses()

  return (
    <>
      <CourseMainBanner course={null} />
      <div className="w-full px-5 pt-[100px] sm:px-[116px]">
        <Dashboard courses={joinedCourses} />
      </div>

      <div className="flex w-full max-w-[1440px] flex-col gap-5 px-5 pt-[32px] sm:px-[116px] md:pt-[100px]">
        <ErrorBoundary fallback={FetchErrorFallback}>
          <Suspense fallback={<CardListFallback />}>
            <CourseCardList title="MY COURSE" courses={joinedCourses} />
          </Suspense>
        </ErrorBoundary>
      </div>

      <CourseSubBanner />
      <div className="h-[100px]" />
    </>
  )
}
