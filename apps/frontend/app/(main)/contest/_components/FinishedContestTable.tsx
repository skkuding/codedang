import DataTable from '@/components/DataTable'
import { fetcher } from '@/lib/utils'
import type { Contest } from '@/types/type'
import { columns } from './Columns'

interface ContestProps {
  data: Contest[]
}

export default async function FinishedContestTable() {
  const ContestData: ContestProps = await fetcher
    .get('contest/finished?take=51')
    .json()

  ContestData.data.forEach((contest) => {
    contest.status = 'finished'
  })

  return (
    <>
      <p className="text-xl font-bold md:text-2xl">Finished</p>
      {/* TODO: Add search bar */}
      <DataTable
        data={ContestData.data}
        columns={columns}
        headerStyle={{
          title: 'text-left w-2/5 md:w-1/3',
          registered: 'w-1/5 md:w-1/6',
          participants: 'w-1/5 md:w-1/6',
          totalScore: 'w-1/5 md:w-1/6',
          period: 'w-1/5 md:w-1/4'
        }}
        linked
        emptyMessage="No finished contests found."
      />
    </>
  )
}
