import DataTable from '@/app/(client)/(main)/_components/DataTable'
import { fetcher, fetcherWithAuth } from '@/libs/utils'
import type { Contest } from '@/types/type'
import type { Session } from 'next-auth'
import { columns } from '../../contest/_components/FinishedTableColumns'

interface ContestProps {
  data: Contest[]
}

export default async function FinishedContestTable({
  search,
  session
}: {
  search: string
  session: Session | null
}) {
  const ContestData: ContestProps = await (session ? fetcherWithAuth : fetcher)
    .get('contest/finished', {
      searchParams: {
        search,
        take: '51'
      }
    })
    .json()

  ContestData.data.forEach((contest) => {
    contest.status = 'finished'
  })

  return (
    <DataTable
      data={ContestData.data}
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
