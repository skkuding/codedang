import DataTable from '@/components/DataTable'
import { fetcher } from '@/lib/utils'
import type { Contest } from '@/types/type'
import { columns } from './Columns'

export default async function FinishedContestTable() {
  const data: {
    finished: Contest[]
  } = await fetcher.get('contest/finished?take=51').json()

  data.finished.forEach((contest) => {
    contest.status = 'finished'
  })

  return (
    <>
      <p className="text-xl font-bold md:text-2xl">Finished</p>
      {/* TODO: Add search bar */}
      <DataTable
        data={data.finished}
        columns={columns}
        headerStyle={{
          title: 'text-left w-2/5 md:w-3/6',
          startTime: 'w-1/5 md:w-1/6',
          endTime: 'w-1/5 md:w-1/6',
          participants: 'w-1/5 md:w-1/6',
          status: 'w-1/4 md:w-1/6'
        }}
        linked
      />
    </>
  )
}
