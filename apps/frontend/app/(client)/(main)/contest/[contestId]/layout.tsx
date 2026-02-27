import { Button } from '@/components/shadcn/button'
import { auth } from '@/libs/auth'
import { fetcher, fetcherWithAuth } from '@/libs/utils'
import pleaseLogo from '@/public/logos/please.png'
import Image from 'next/image'
import { Cover } from '../../_components/Cover'
import { ContestTabs } from '../_components/ContestTabs'

interface ContestDetailProps {
  params: Promise<{
    contestId: string
  }>
  tabs: React.ReactNode
}

export default async function Layout(props: ContestDetailProps) {
  const { tabs } = props
  const { contestId } = await props.params
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
        <h2 className="text-title1_sb_20 mb-[6px]">
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
