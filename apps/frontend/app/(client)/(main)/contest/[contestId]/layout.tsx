import { Button } from '@/components/shadcn/button'
import { auth } from '@/libs/auth'
import { fetcher, fetcherWithAuth } from '@/libs/utils'
import pleaseLogo from '@/public/logos/please.png'
import Image from 'next/image'
import { Cover } from '../../_components/Cover'
import { ContestTabs } from '../_components/ContestTabs'

interface ContestDetailProps {
  params: {
    contestId: string
  }
  tabs: React.ReactNode
}

export default async function Layout({ params, tabs }: ContestDetailProps) {
  const { contestId } = params
  const session = await auth()

  const res = await (session ? fetcherWithAuth : fetcher).get(
    `contest/${contestId}`
  )
  if (res.ok) {
    return (
      <>
        <Cover
          title="CONTEST"
          description="Challenge yourself to a variety of questions!"
        />
        <article>
          <ContestTabs contestId={contestId} />
          {tabs}
        </article>
      </>
    )
  }
  return (
    <>
      <Cover
        title="CONTEST"
        description="Challenge yourself to a variety of questions!"
      />
      <div className="flex flex-col items-center justify-center">
        <Image
          className="pb-10 pt-48"
          src={pleaseLogo}
          alt="please"
          width={300}
          height={300}
        />
        <h2 className="mb-[6px] text-xl font-semibold">
          WAITING FOR NEW CONTESTS!
        </h2>
        <p className="mb-[26px] text-center text-neutral-500">
          There are no upcoming contests.
          <br /> If you want to create a contest on Codedang, please contact us!
        </p>
        <a href="https://pf.kakao.com/_UKraK/chat" target="_blank">
          <Button
            variant={'secondary'}
            className="text-primary mb-44 w-60 bg-white font-bold"
          >
            Go to the Contact
          </Button>
        </a>
      </div>
    </>
  )
}
