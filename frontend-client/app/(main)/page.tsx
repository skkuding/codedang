import { Button } from '@/components/ui/button'
// import { fetcher } from '@/lib/utils'
import dummyImg from '@/public/dummy.png'
import GithubLogo from '@/public/github.svg'
import SkkudingLogo from '@/public/skkudingLogo.png'
import type { WorkbookProblem } from '@/types/type'
import type { Route } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import Carousel from './_components/Carousel'
import ContestCards from './_components/ContestCards'
import ProblemCard from './_components/ProblemCard'

// FIXME: Build error occurs when using static routes
// Disable static routes as a workaround for now
// https://github.com/vercel/next.js/issues/54961
export const dynamic = 'force-dynamic'

const slides = [
  {
    topTitle: 'Codedang,',
    bottomTitle: 'Online Judge for SKKU',
    sub: 'Level up your coding skills with us',
    img: dummyImg,
    imgAlt: 'Codedang Intro Banner',
    color: 'green',
    href: '/problem'
  },
  {
    topTitle: 'SKKUDING',
    bottomTitle: 'Beta Service',
    sub: `Feel free to contact us if there's any bug`,
    img: SkkudingLogo,
    imgAlt: 'SKKUDING Beta service Banner',
    color: 'black',
    href: '/'
  },
  {
    topTitle: 'Contribute to',
    bottomTitle: 'Codedang on GitHub',
    sub: 'Our project is open source!',
    img: GithubLogo,
    imgAlt: 'Github Link Banner',
    color: 'yellow',
    href: 'https://github.com/skkuding/codedang'
  }
]

export default async function Home() {
  // const problems: WorkbookProblem[] = await fetcher
  //   .get('problem', {
  //     searchParams: {
  //       take: 3,
  //       workbookId: 1
  //     }
  //   })
  //   .json()
  const problems: WorkbookProblem[] = []

  return (
    <div className="flex w-full flex-col gap-12 lg:items-center">
      <Carousel slides={slides} />
      <Suspense fallback={<div>Loading...</div>}>
        <ContestCards />
      </Suspense>
      {problems.length !== 0 && (
        <div className="flex w-full flex-col gap-3">
          <div className="flex w-full items-center justify-between text-gray-700">
            <p className="text-xl font-bold">Professor’s Recommendation</p>
            <Link href={'/workbook/1' as Route}>
              <Button variant="outline" className="h-8">
                More
              </Button>
            </Link>
          </div>
          <div className="grid w-full grid-cols-3 gap-5">
            {problems.map((problem) => {
              return (
                <Link
                  key={problem.problemId}
                  href={`/problem/${problem.problemId}` as Route}
                  className="inline-block w-full"
                >
                  <ProblemCard problem={problem} />
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
