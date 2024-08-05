import { Button } from '@/components/ui/button'
import type { Route } from 'next'
import Link from 'next/link'
import Carousel from './_components/Carousel'
import ContestCards from './_components/ContestCards'
// import ContestCards from './_components/ContestCards'
import ProblemCards from './_components/ProblemCards'

// FIXME: Build error occurs when using static routes
// Disable static routes as a workaround for now
// https://github.com/vercel/next.js/issues/54961
export const dynamic = 'force-dynamic'

const slides = [
  {
    type: 'codedang',
    topTitle: 'Welcome to',
    bottomTitle: 'CODEDANG',
    sub: 'Online Judge Platform for SKKU',
    href: '/problem'
  },
  {
    type: 'github',
    topTitle: 'Contribute to',
    bottomTitle: 'Codedang on GitHub',
    sub: 'Our project is open source',
    href: 'https://github.com/skkuding/codedang'
  },
  {
    type: 'skkuding',
    topTitle: 'SKKUDING',
    bottomTitle: 'Beta Service',
    sub: "Feel free to contact us if there's any bug",
    href: 'https://pf.kakao.com/_UKraK/chat'
  }
]

export default function Home() {
  return (
    <div className="flex w-full flex-col gap-12 lg:items-center">
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
      <div className="flex w-full flex-col gap-6">
        <div className="flex w-full items-center justify-between text-gray-700">
          <p className="text-2xl font-bold">Contest 🏆</p>
          <Link href={'/problem' as Route}>
            <Button variant="ghost" className="h-8 px-3">
              See More
            </Button>
          </Link>
        </div>
        <div className="grid w-full grid-cols-3 gap-5">
          <ContestCards />
        </div>
        <div className="flex w-full items-center justify-between text-gray-700">
          <p className="text-2xl font-bold">Problem ✨</p>
          <Link href={'/problem' as Route}>
            <Button variant="ghost" className="h-8 px-3">
              See More
            </Button>
          </Link>
        </div>
        <div className="grid w-full grid-cols-3 gap-5">
          <ProblemCards />
        </div>
      </div>
    </div>
  )
}
