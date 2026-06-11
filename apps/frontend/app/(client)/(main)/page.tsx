import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { ErrorBoundary } from '@suspensive/react'
import { InstagramCards } from './_components/InstagramCards'
import { MainBanner } from './_components/MainBanner'
// import { MiddleBanner } from './_components/MiddleBanner'
import { NavigationButtons } from './_components/NavigationButtons'
import { NewProblemCards } from './_components/NewProblemCards'
import { ServiceCards } from './_components/ServiceCards'

export default function Home() {
  return (
    <div className="mt-14 flex w-full flex-col items-center md:gap-[80px]">
      <ErrorBoundary fallback={FetchErrorFallback}>
        <MainBanner />
      </ErrorBoundary>
      <div className="md:hidden">
        <NavigationButtons />
      </div>
      <div className="flex w-full min-w-0 max-w-[1380px] flex-col md:gap-[100px]">
        <ErrorBoundary fallback={FetchErrorFallback}>
          <ServiceCards />
        </ErrorBoundary>
        <ErrorBoundary fallback={FetchErrorFallback}>
          <NewProblemCards />
        </ErrorBoundary>
        {/* TODO: problem/create 페이지 작업 완료 시 복구 */}
        {/* <ErrorBoundary fallback={FetchErrorFallback}>
          <MiddleBanner />
        </ErrorBoundary> */}
        <ErrorBoundary fallback={FetchErrorFallback}>
          <InstagramCards />
        </ErrorBoundary>
      </div>
    </div>
  )
}
