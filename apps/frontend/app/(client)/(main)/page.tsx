import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { ErrorBoundary } from '@suspensive/react'
import { InstagramCards } from './_components/InstagramCards'
import { MainBanner } from './_components/MainBanner'
import { MiddleBanner } from './_components/MiddleBanner'
import { NavigationButtons } from './_components/NavigationButtons'
import { NewProblemCards } from './_components/NewProblemCards'
import { ServiceCards } from './_components/ServiceCards'

export default function Home() {
  return (
    <div className="mt-14 flex w-full flex-col md:gap-[80px] lg:items-center">
      <ErrorBoundary fallback={FetchErrorFallback}>
        <MainBanner />
      </ErrorBoundary>
      <div className="md:hidden">
        <NavigationButtons />
      </div>
      <div className="flex flex-col md:gap-[100px]">
        <ErrorBoundary fallback={FetchErrorFallback}>
          <ServiceCards />
        </ErrorBoundary>
        <ErrorBoundary fallback={FetchErrorFallback}>
          <NewProblemCards />
        </ErrorBoundary>
        <ErrorBoundary fallback={FetchErrorFallback}>
          <MiddleBanner />
        </ErrorBoundary>
        <ErrorBoundary fallback={FetchErrorFallback}>
          <InstagramCards />
        </ErrorBoundary>
      </div>
    </div>
  )
}
