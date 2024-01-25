import DataTable from '@/components/DataTable'
import { fetcher } from '@/lib/utils'
import type { Contest } from '@/types/type'
import { columns } from './_components/Columns'
import ContestCardList from './_components/ContestCardList'

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
      <DataTable
        data={data.finished}
        columns={columns}
        headerStyle={{
          title: 'text-left w-2/4 md:w-4/6',
          startTime: 'w-1/4 md:w-1/6',
          endTime: 'w-1/4 md:w-1/6',
          participants: 'w-1/4 md:w-1/6'
        }}
        name="contest"
      />
    </>
  )
}
