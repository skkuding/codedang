import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { ErrorBoundary } from '@suspensive/react'
import { Carousel } from './_components/Carousel'
import { InstagramCards } from './_components/InstagramCards'
import { MiddleContestBanner } from './_components/MiddleContestBanner'
import { NewProblemCards } from './_components/NewProblemCards'
import { ServiceCards } from './_components/ServiceCards'

const slides = [
  {
    type: 'codedang',
    topTitle: 'Your Coding Journey',
    bottomTitle: 'Starts Here',
    sub: "Practice real problems, compete with peers.\nGrow your skills on SKKU's coding platform.",
    img: '/banners/main_banner.png',
    imgAlt: 'Codedang',
    href: 'https://about-codedang.framer.website'
  }
]

export default function Home() {
  return (
    // NOTE: Temporary margin top for codedang main page carousel to avoid header overlap (until main page design is finalized)

    <div className="mt-14 flex w-full flex-col gap-[140px] lg:items-center">
      <Carousel slides={slides} />
      <div className="flex flex-col [&>*]:mb-[140px]">
        <ErrorBoundary fallback={FetchErrorFallback}>
          <ServiceCards />
        </ErrorBoundary>
        <ErrorBoundary fallback={FetchErrorFallback}>
          <NewProblemCards />
        </ErrorBoundary>
        <ErrorBoundary fallback={FetchErrorFallback}>
          <MiddleContestBanner />
        </ErrorBoundary>
        <ErrorBoundary fallback={FetchErrorFallback}>
          <InstagramCards />
        </ErrorBoundary>
      </div>
    </div>
  )
}
