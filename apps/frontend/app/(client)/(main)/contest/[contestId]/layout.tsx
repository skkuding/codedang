import { Button } from '@/components/shadcn/button'
import { auth } from '@/libs/auth'
import { fetcher, fetcherWithAuth } from '@/libs/utils'
import pleaseLogo from '@/public/logos/please.png'
import { getTranslate } from '@/tolgee/server'
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
  const t = await getTranslate()
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
          title={t('contest_title')}
          description={t('contest_description')}
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
        title={t('contest_title')}
        description={t('contest_description')}
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
          {t('waiting_for_new_contests')}
        </h2>
        <p className="mb-[26px] text-center text-neutral-500">
          {t('no_upcoming_contests')}
          <br /> {t('create_contest_contact_us')}
        </p>
        <a href="https://pf.kakao.com/_UKraK/chat" target="_blank">
          <Button
            variant={'secondary'}
            className="text-primary mb-44 w-60 bg-white font-bold"
          >
            {t('go_to_the_contact')}
          </Button>
        </a>
      </div>
    </>
  )
}
