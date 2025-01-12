import FetchErrorFallback from '@/components/FetchErrorFallback'
import { ErrorBoundary } from '@suspensive/react'
import Carousel from './_components/Carousel'
import ContestCards from './_components/ContestCards'
import ProblemCards from './_components/ProblemCards'

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
    <div className="flex w-full flex-col gap-16 lg:items-center">
      <Carousel slides={slides} />
      {/* <div className="flex w-full flex-col gap-3">
        <div className="flex w-full items-center justify-between text-gray-700">
          <p className="text-xl font-bold">Contest</p>
          <Link href="/contest">
            <Button variant="outline" className="h-8">
              More
            </Button>
          </Link>
        </div>
        <div className="grid w-full grid-cols-3 gap-5">
          <Suspense
            fallback={[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="flex h-[120px] w-full rounded-xl" />
            ))}
          >
            <ContestCards />
          </Suspense>
        </div>
      </div> */}

      <ErrorBoundary fallback={FetchErrorFallback}>
        <ContestCards />
      </ErrorBoundary>

      <ErrorBoundary fallback={FetchErrorFallback}>
        <ProblemCards />
      </ErrorBoundary>
    </div>
  )
}
