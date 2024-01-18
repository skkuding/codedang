import { fetcher } from '@/lib/utils'
import type { Contest } from '@/types/type'
import ContestCardList from './_components/ContestCardList'
import ContestTable from './_components/ContestTable'

export default async function Contest() {
  const data: {
    finished: Contest[]
  } = await fetcher.get('contest/finished?take=51').json()
  data.finished.forEach((contest) => {
    contest.status = 'finished'
  })

  return (
    <>
      <div className="mb-12 flex flex-col gap-12">
        <ContestCardList type="Ongoing" />
        <ContestCardList type="Upcoming" />
      </div>
      <p className="text-xl font-bold md:text-2xl">Finished</p>
      {/* TODO: Add search bar */}
      <ContestTable data={data.finished} />
    </>
  )
}
