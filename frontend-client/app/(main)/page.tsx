import dummyImg from '@/public/dummy.png'
import GithubLogo from '@/public/github.svg'
import SkkudingLogo from '@/public/skkudingLogo.png'
import { Suspense } from 'react'
import Carousel from './_components/Carousel'
import ContestCards from './_components/ContestCards'
import ProblemCards from './_components/ProblemCards'

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
  return (
    <div className="flex w-full flex-col gap-12 lg:items-center">
      <Carousel slides={slides} />
      <Suspense fallback={<div>Loading...</div>}>
        <ContestCards />
      </Suspense>
      <Suspense fallback={<div>Loading...</div>}>
        <ProblemCards />
      </Suspense>
    </div>
  )
}
