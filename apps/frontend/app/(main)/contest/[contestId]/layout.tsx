import ContestStatusTimeDiff from '@/components/ContestStatusTimeDiff'
import { fetcher } from '@/lib/utils'
import type { Contest } from '@/types/type'
import ContestTabs from '../_components/ContestTabs'

interface ContestDetailProps {
  params: {
    contestId: string
  }
}

export default async function Layout({
  params,
  tabs
}: {
  params: ContestDetailProps['params']
  tabs: React.ReactNode
}) {
  const { contestId } = params
  const res = await fetcher.get(`contest/${contestId}`)
  if (res.ok) {
    const contest: Contest = await res.json()

    return (
      <article>
        <header className="flex justify-between p-5 py-8">
          <h2 className="break-words text-2xl font-extrabold">
            {contest?.title}
          </h2>
          <ContestStatusTimeDiff
            contest={contest}
            textStyle="text-gray-500"
            makeToast={false}
          />
        </header>
        <ContestTabs contestId={contestId} />
        {tabs}
      </article>
    )
  }
  return <p className="text-center">No Results.</p>
}
