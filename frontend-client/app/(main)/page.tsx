import { Button } from '@/components/ui/button'
import { fetcher } from '@/lib/utils'
import dummyImg from '@/public/dummy.png'
import GithubLogo from '@/public/github.svg'
import SkkudingLogo from '@/public/skkudingLogo.png'
import type { Contest, WorkbookProblem } from '@/types/type'
import type { Route } from 'next'
import Link from 'next/link'
import Carousel from './_components/Carousel'
import ContestCard from './_components/ContestCard'
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

const getContests = async () => {
  const data: {
    ongoing: Contest[]
    upcoming: Contest[]
  } = await fetcher.get('contest').json()
  data.ongoing.forEach((contest) => {
    contest.status = 'ongoing'
  })
  data.upcoming.forEach((contest) => {
    contest.status = 'upcoming'
  })
  let contests = data.ongoing.concat(data.upcoming)

  if (contests.length < 3) {
    const data: {
      finished: Contest[]
    } = await fetcher
      .get('contest/finished', {
        searchParams: {
          take: 3
        }
      })
      .json()
    data.finished.forEach((contest) => {
      contest.status = 'finished'
    })
    contests = contests.concat(data.finished)
  }
  return contests.slice(0, 3)
}

export default async function Home() {
  const contests = await getContests()
  const problems: WorkbookProblem[] = await fetcher
    .get('problem', {
      searchParams: {
        take: 3,
        workbookId: 1
      }
    })
    .json()
  return (
    <div className="flex w-full flex-col gap-12 lg:items-center">
      <Carousel slides={slides} />
      {contests.length !== 0 && (
        <div className="flex w-full flex-col gap-3">
          <div className="flex w-full items-center justify-between text-gray-700">
            <p className="text-xl font-bold">Contest</p>
            <Link href="/contest">
              <Button variant="outline" className="h-8">
                More
              </Button>
            </Link>
          </div>
          <div className="grid w-full grid-cols-3 gap-5">
            {contests.map((contest) => {
              return (
                <Link
                  key={contest.id}
                  href={`/contest/${contest.id}` as Route}
                  className="inline-block w-full"
                >
                  <ContestCard contest={contest} />
                </Link>
              )
            })}
          </div>
        </div>
      )}
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
