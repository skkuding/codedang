import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Skeleton } from '@/components/shadcn/skeleton'
import { auth } from '@/libs/auth'
import { cn } from '@/libs/utils'
import welcomeLogo from '@/public/logos/welcome.png'
import { ErrorBoundary } from '@suspensive/react'
import Image from 'next/image'
import { Suspense } from 'react'
import { CourseCardList } from './_components/CourseCardList'
import { CourseMainBanner } from './_components/CourseMainBanner'
import { CourseSubBanner } from './_components/CourseSubBanner'
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

export default async function Course() {
  const session = await auth()

  const palette = [
    // primary 계열
    'primary',
    'primary-light',
    'primary-strong',
    'primary-heavy',
    // background 계열
    'background',
    'background-alternative',
    // line 계열
    'line',
    'line-neutral',
    // fill 계열
    'fill',
    'fill-neutral',
    // secondary, error
    'secondary',
    'error',
    // level (dark)
    'level-dark-1',
    'level-dark-2',
    'level-dark-3',
    'level-dark-4',
    'level-dark-5',
    // level (light)
    'level-light-1',
    'level-light-2',
    'level-light-3',
    'level-light-4',
    'level-light-5',
    // level (default)
    'level-1',
    'level-2',
    'level-3',
    'level-4',
    'level-5'
  ]

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
        </div>
      </>
    )
  }

  return (
    <>
      <CourseMainBanner course={null} />
      <div className="flex w-full max-w-7xl flex-col gap-5 px-5 pt-[100px]">
        <ErrorBoundary fallback={FetchErrorFallback}>
          <Suspense fallback={<CardListFallback />}>
            <CourseCardList title="MY COURSE" />
          </Suspense>
        </ErrorBoundary>
      </div>
      <CourseSubBanner />
      <div className="py-5" />
      <div className="flex flex-col">
        {palette.map((color) => (
          <div key={color} className="my-2 flex items-center">
            <div className={cn(`bg-${color} h-4 w-12 rounded`)} />
            <span className="ml-4">{color}</span>
          </div>
        ))}
      </div>
      <div className="h-[100px]" />
    </>
  )
}
