'use client'

import { AlertModal } from '@/components/AlertModal'
import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Button } from '@/components/shadcn/button'
import { ErrorBoundary } from '@suspensive/react'
import { Carousel } from './_components/Carousel'
import { ContestCards } from './_components/ContestCards'
import { InstagramCards } from './_components/InstagramCards'
import { MiddleContestBanner } from './_components/MiddleContestBanner'
import { NewProblemCards } from './_components/NewProblemCards'
import { ProblemCards } from './_components/ProblemCards'
import { ServiceCards } from './_components/ServiceCards'

const slides = [
  {
    type: 'codedang',
    topTitle: 'Welcome to',
    bottomTitle: 'CODEDANG',
    sub: 'Online Judge Platform for SKKU',
    img: '/banners/codedang-carousel.png',
    imgAlt: 'Codedang',
    href: '/problem'
  },
  {
    type: 'github',
    topTitle: 'Contribute to',
    bottomTitle: 'Codedang on GitHub',
    sub: 'Our project is open source',
    img: '/banners/github.png',
    imgAlt: 'GitHub',
    href: 'https://github.com/skkuding/codedang'
  },
  {
    type: 'skkuding',
    topTitle: 'SKKUDING',
    bottomTitle: 'Beta Service',
    sub: "Feel free to contact us if there's any bug",
    img: '/banners/bug.png',
    imgAlt: 'Bug',
    href: 'https://pf.kakao.com/_UKraK/chat'
  }
]

export default function Home() {
  return (
    // NOTE: Temporary margin top for codedang main page carousel to avoid header overlap (until main page design is finalized)
    <div className="mt-14 flex w-full flex-col gap-16 lg:items-center">
      <AlertModal
        type={'confirm'}
        title="Question Submitted"
        description="Your question has been successfully submitted. Our team will review it and respond shortly."
        primaryButton={{
          text: 'Confirm',
          onClick: () => {},
          variant: 'default'
        }}
        showIcon={true}
        showCancelButton={false}
        trigger={<Button className="btn">Submit Question</Button>}
      />
      <Carousel slides={slides} />
      <ErrorBoundary fallback={FetchErrorFallback}>
        <ServiceCards />
      </ErrorBoundary>
      <ErrorBoundary fallback={FetchErrorFallback}>
        <ContestCards />
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
      <ErrorBoundary fallback={FetchErrorFallback}>
        <ProblemCards />
      </ErrorBoundary>
    </div>
  )
}
