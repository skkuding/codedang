import { DataTable } from '@/app/(client)/(main)/_components/DataTable'
import { fetcher, fetcherWithAuth } from '@/libs/utils'
import type { Contest } from '@/types/type'
import type { Session } from 'next-auth'
import { columns } from './FinishedTableColumns'

interface ContestProps {
  finished: Contest[]
}

export async function FinishedContestTable({
  search,
  session
}: {
  search: string
  session: Session | null
}) {
  const ContestData: ContestProps = await (session ? fetcherWithAuth : fetcher)
    .get('contest', {
      searchParams: {
        search
      }
    })
    .json()

  ContestData.finished.forEach((contest) => {
    contest.status = 'finished'
  })

  return (
    <DataTable
      data={ContestData.finished}
      columns={columns}
      headerStyle={{
        title: 'text-left w-2/5 md:w-1/2',
        registered: 'w-1/5 md:w-1/6',
        participants: 'w-1/5 md:w-1/6',
        period: 'w-1/5 md:w-1/3'
      }}
      linked
    />
  )
}
