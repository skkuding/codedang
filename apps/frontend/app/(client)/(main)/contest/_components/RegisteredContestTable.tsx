import DataTable from '@/app/(client)/(main)/_components/DataTable'
import { fetcherWithAuth } from '@/libs/utils'
import type { Contest } from '@/types/type'
import { columns } from './RegisteredTableColumns'

const getOngoingUpcomingContests = async (search: string) => {
  const data: {
    registeredOngoing: Contest[]
    registeredUpcoming: Contest[]
  } = await fetcherWithAuth
    .get('contest/registered-ongoing-upcoming', {
      searchParams: {
        search,
        take: '51'
      }
    })
    .json()

  return [
    ...data.registeredOngoing.map((item) => ({
      ...item,
      status: 'ongoing' as const
    })),
    ...data.registeredUpcoming.map((item) => ({
      ...item,
      status: 'upcoming' as const
    }))
  ]
}

const getFinishedContests = async (search: string) => {
  const data = await getOngoingUpcomingContests(search)

  const finishedData: { data: Contest[] } = await fetcherWithAuth
    .get('contest/registered-finished', {
      searchParams: {
        search,
        take: '51'
      }
    })
    .json()

  return [
    ...data,
    ...finishedData.data.map((item) => ({
      ...item,
      status: 'finished' as const
    }))
  ]
}

export default async function RegisteredContestTable({
  search
}: {
  search: string
}) {
  const data = await getFinishedContests(search)

  return (
    <>
      <DataTable
        data={data}
        columns={columns}
        headerStyle={{
          title: 'text-left w-2/5 md:w-1/2',
          status: 'w-1/5 md:w-1/6',
          participants: 'w-1/5 md:w-1/6',
          period: 'w-1/5 md:w-1/3'
        }}
        linked
      />
    </>
  )
}
