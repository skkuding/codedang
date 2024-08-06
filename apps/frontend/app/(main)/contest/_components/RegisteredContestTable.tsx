import DataTable from '@/components/DataTable'
import { fetcherWithAuth } from '@/lib/utils'
import type { Contest } from '@/types/type'
import { columns } from './RegisteredTableColumns'

interface FinishedContestProps {
  data: Contest[]
}

const getOngoingUpcomingContests = async () => {
  const data: {
    registeredOngoing: Contest[]
    registeredUpcoming: Contest[]
  } = await fetcherWithAuth.get('contest/registered-ongoing-upcoming').json()
  data.registeredOngoing.forEach((contest) => {
    contest.status = 'ongoing'
  })
  data.registeredUpcoming.forEach((contest) => {
    contest.status = 'upcoming'
  })
  return data.registeredOngoing.concat(data.registeredUpcoming)
}

const getFinishedContests = async () => {
  const data = await getOngoingUpcomingContests()

  const FinishedData: FinishedContestProps = await fetcherWithAuth
    .get('contest/registered-finished?take=51')
    .json()
  FinishedData.data.forEach((contest) => {
    contest.status = 'finished'
  })
  return data.concat(FinishedData.data)
}

export default async function RegisteredContestTable() {
  const data = await getFinishedContests()

  return (
    <>
      <DataTable
        data={data}
        columns={columns}
        headerStyle={{
          title: 'text-left w-2/5 md:w-1/3',
          status: 'w-1/5 md:w-1/6',
          participants: 'w-1/5 md:w-1/6',
          totalScore: 'w-1/5 md:w-1/6',
          period: 'w-1/5 md:w-1/4'
        }}
        linked
      />
    </>
  )
}
