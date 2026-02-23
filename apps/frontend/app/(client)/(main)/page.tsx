import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { ErrorBoundary } from '@suspensive/react'
import { useTranslate } from '@tolgee/react'
import { Carousel } from './_components/Carousel'
import { InstagramCards } from './_components/InstagramCards'
import { MiddleContestBanner } from './_components/MiddleContestBanner'
import { NavigationButtons } from './_components/NavigationButtons'
import { NewProblemCards } from './_components/NewProblemCards'
import { ServiceCards } from './_components/ServiceCards'

export default function Home() {
  const { t } = useTranslate()

  const slides = [
    {
      type: 'codedang',
      topTitle: t('your_coding_journey'),
      bottomTitle: t('starts_here'),
      sub: t('codedang_subtitle'),
      subMobile: t('compete_grow_skku_coding'),
      img: '/banners/main_banner.png',
      imgMobile: '/banners/mobile_main_banner.svg',
      imgAlt: 'Codedang',
      href: 'https://about-codedang.framer.website'
    }
  ]
  return (
    // NOTE: Temporary margin top for codedang main page carousel to avoid header overlap (until main page design is finalized)

    <div className="mt-14 flex w-full flex-col md:gap-[140px] lg:items-center">
      <Carousel slides={slides} />
      <div className="md:hidden">
        <NavigationButtons />
      </div>
      <div className="flex flex-col md:gap-[140px]">
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
