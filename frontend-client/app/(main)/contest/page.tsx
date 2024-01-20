import DataTable from '@/components/DataTable'
import { fetcher } from '@/lib/utils'
import type { Contest } from '@/types/type'
import ContestCardList from '../_components/ContestCardList'
import { columns } from './_components/Columns'
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
      {/* TODO: Add contest card list */}
      <ContestCardList type={'Ongoing'} />

      <p className="text-xl font-bold md:text-2xl">Finished</p>
      {/* TODO: Add search bar */}
      <DataTable
        data={data.finished}
        columns={columns}
        headerStyle={{
          title: 'w-2/4 md:w-4/6',
          startTime: 'text-center w-1/4 md:w-1/6',
          endTime: 'text-center w-1/4 md:w-1/6',
          participants: 'text-center w-1/4 md:w-1/6'
        }}
        name="contest"
      />
    </>
  )
}
