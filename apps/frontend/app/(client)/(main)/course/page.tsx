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
  const palette = [
    // common 계열
    'color-common-100',
    'color-common-0',
    // neutral 계열
    'color-neutral-99',
    'color-neutral-95',
    'color-neutral-90',
    'color-neutral-80',
    'color-neutral-70',
    'color-neutral-60',
    'color-neutral-50',
    'color-neutral-40',
    'color-neutral-30',
    'color-neutral-20',
    'color-neutral-15',
    'color-neutral-10',
    'color-neutral-5',
    // red 계열
    'color-red-95',
    'color-red-90',
    'color-red-80',
    'color-red-70',
    'color-red-60',
    'color-red-50',
    'color-red-40',
    'color-red-30',
    'color-red-20',
    'color-red-10',
    'color-red-5',
    // orange 계열
    'color-orange-95',
    'color-orange-90',
    'color-orange-80',
    'color-orange-70',
    'color-orange-60',
    'color-orange-50',
    'color-orange-40',
    'color-orange-30',
    'color-orange-20',
    'color-orange-10',
    'color-orange-5',
    // yellow 계열
    'color-yellow-95',
    'color-yellow-90',
    'color-yellow-80',
    'color-yellow-70',
    'color-yellow-60',
    'color-yellow-50',
    'color-yellow-40',
    'color-yellow-30',
    'color-yellow-20',
    'color-yellow-10',
    'color-yellow-5',
    // lime 계열
    'color-lime-95',
    'color-lime-90',
    'color-lime-80',
    'color-lime-70',
    'color-lime-60',
    'color-lime-50',
    'color-lime-40',
    'color-lime-30',
    'color-lime-20',
    'color-lime-10',
    'color-lime-5',
    // green 계열
    'color-green-95',
    'color-green-90',
    'color-green-80',
    'color-green-70',
    'color-green-60',
    'color-green-50',
    'color-green-40',
    'color-green-30',
    'color-green-20',
    'color-green-10',
    'color-green-5',
    // cyan 계열
    'color-cyan-95',
    'color-cyan-90',
    'color-cyan-80',
    'color-cyan-70',
    'color-cyan-60',
    'color-cyan-50',
    'color-cyan-40',
    'color-cyan-30',
    'color-cyan-20',
    'color-cyan-10',
    'color-cyan-5',
    // blue 계열
    'color-blue-95',
    'color-blue-90',
    'color-blue-80',
    'color-blue-70',
    'color-blue-60',
    'color-blue-50',
    'color-blue-40',
    'color-blue-30',
    'color-blue-20',
    'color-blue-10',
    'color-blue-5',
    // violet 계열
    'color-violet-95',
    'color-violet-90',
    'color-violet-80',
    'color-violet-70',
    'color-violet-60',
    'color-violet-50',
    'color-violet-40',
    'color-violet-30',
    'color-violet-20',
    'color-violet-10',
    'color-violet-5',
    // pink 계열
    'color-pink-95',
    'color-pink-90',
    'color-pink-80',
    'color-pink-70',
    'color-pink-60',
    'color-pink-50',
    'color-pink-40',
    'color-pink-30',
    'color-pink-20',
    'color-pink-10',
    'color-pink-5'
  ]

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
          <div className="flex flex-col">
            {palette.map((color) => (
              <div key={color} className="my-2 flex items-center">
                <div className={cn(`bg-${color} h-4 w-12 rounded`)} />
                <span className="ml-4">{color}</span>
              </div>
            ))}
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <CourseMainBanner course={null} />
      <div className="flex w-full max-w-[1440px] flex-col gap-5 px-[116px] pt-[100px]">
        <ErrorBoundary fallback={FetchErrorFallback}>
          <Suspense fallback={<CardListFallback />}>
            <CourseCardList title="MY COURSE" />
          </Suspense>
        </ErrorBoundary>
      </div>
      <CourseSubBanner />
      <div className="h-[100px]" />
    </>
  )
}
