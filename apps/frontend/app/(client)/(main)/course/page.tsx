import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Skeleton } from '@/components/shadcn/skeleton'
import { auth } from '@/libs/auth'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense } from 'react'
import { CourseCardList } from './_components/CourseCardList'
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
      <div className="flex w-full max-w-[1440px] flex-col px-5 pt-[32px] sm:px-[116px] md:pt-[100px]">
        <div className="flex flex-col pb-12">
          <span className="text-head1_b_40">COURSE</span>
          <span className="text-color-neutral-40 text-sub2_m_18">
            전반적인 교육과정을 연계하여 관리해보세요
          </span>
        </div>
        <span className="text-head3_sb_28 mb-6">나의 강좌</span>
        <div className="border-line flex w-full flex-col items-center justify-center gap-4 rounded-[12px] border bg-white py-20">
          <div className="text-sub1_sb_18 text-color-cool-neutral-30 flex flex-col items-center justify-center">
            <p>나의 강좌를 살펴보려면</p>
            <p>코드당 로그인을 진행해주세요</p>
          </div>
          <LoginButton className="text-sub4_sb_14 flex h-10 w-[106px] items-center justify-center" />
        </div>
        <span className="text-head3_sb_28 mt-15 mb-6">나의 대시보드</span>
        <div className="border-line flex w-full flex-col items-center justify-center gap-4 rounded-[12px] border bg-white py-20">
          <div className="text-sub1_sb_18 text-color-cool-neutral-30 flex flex-col items-center justify-center">
            <p>나의 대시보드를 살펴보려면</p>
            <p>코드당 로그인을 진행해주세요</p>
          </div>
          <LoginButton className="text-sub4_sb_14 flex h-10 w-[106px] items-center justify-center" />
        </div>
        <div className="py-5" />
        <div className="h-[100px]" />
      </div>
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
