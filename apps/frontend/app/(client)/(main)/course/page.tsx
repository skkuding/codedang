import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Skeleton } from '@/components/shadcn/skeleton'
import { auth } from '@/libs/auth'
import welcomeLogo from '@/public/logos/welcome.png'
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

export default async function Course() {
  const session = await auth()
  if (!session) {
    return (
      <>
        <CourseMainBanner course={null} />
        <div className="flex w-full max-w-7xl flex-col items-center justify-center p-5 py-48">
          <Image src={welcomeLogo} alt="welcome" />
          <p className="text-head5_sb_24 mt-10">Please Login!</p>
          <div className="text-body3_r_16 mt-2 text-center text-[#7F7F7F]">
            <p>This page is only available to logged-in users.</p>
            <p>Click the button below to login.</p>
          </div>
          <LoginButton className="mt-6 flex h-[46px] w-60 items-center justify-center text-base font-bold" />
          <div className="py-5" />
        </div>
      </>
    )
  }

  return (
    <>
      <div className="flex w-full max-w-[1440px] flex-col px-5 pt-[32px] sm:px-[116px] md:pt-[100px]">
        <div className="flex flex-col pb-12">
          <span className="text-head1_b_40">COURSE</span>
          <span className="text-color-neutral-40 text-sub2_m_18">
            전반적인 교육과정을 연계하여 관리해보세요
          </span>
        </div>
        <ErrorBoundary fallback={FetchErrorFallback}>
          <Suspense fallback={<CardListFallback />}>
            <CourseCardList title="나의 강좌" />
          </Suspense>
        </ErrorBoundary>
      </div>
      <div className="w-full px-5 md:px-[116px]">
        <Dashboard />
      </div>
      <CourseSubBanner />
      <div className="h-[100px]" />
    </>
  )
}
